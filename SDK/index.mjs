import {S3Client, GetObjectTaggingCommand} from "@aws-sdk/client-s3";
import {LambdaClient, CreateAliasCommand, UpdateFunctionCodeCommand,  UpdateAliasCommand ,CreateFunctionCommand, PackageType, Architecture,Runtime} from "@aws-sdk/client-lambda";

const s3 = new S3Client({ region: "us-east-1" }); // replace "us-east-1" with your AWS region
const lambda = new LambdaClient({region: "us-east-1" });

export const handler = async function(event)
{

  console.log(JSON.stringify(event));
  
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

  console.log("bucket="+ bucket);
  console.log("key=" + key);

  const input = { // GetObjectTaggingRequest
    Bucket: bucket, // required
    Key: key // required
  };
  const command = new GetObjectTaggingCommand(input);
  const response = await s3.send(command);

  console.log(JSON.stringify(response));

  const action = getTagValue('action', response.TagSet);
  const fname = getTagValue('fname', response.TagSet);
  const role = getTagValue('role', response.TagSet);
  const handler = getTagValue('handler', response.TagSet);

  console.log("TagValues", action, fname, role, handler);
  switch(action)
  {
    case 'create':
      await createFunction(bucket, key, fname, role, handler);
      break;

    case 'update':
      await updateFunction(fname, bucket, key);
      break;

    case 'delete':
        console.log('Not Implemented');
        break;

    default:
      console.log('No action recognized');
  }
  

};

const getTagValue = (name, arr)=>{
  for(let i=0 ; i < arr.length ; i++)
  {
    if(arr[i].Key === name)
    {
      return(arr[i].Value);
    }
  }
  return(null);
};


const createFunction = async (bucket, key, fname, role, handler) => {

  const command = new CreateFunctionCommand({
    //Code: { ZipFile: code },
    Code: { S3Bucket: bucket,
            S3Key: key
    },
    FunctionName: fname,
    Description:'Function Created By SDK',
    Publish:false,
    Role: role,
    Architectures: [Architecture.arm64],
    Handler: handler, // Required when sending a .zip file
    PackageType: PackageType.Zip, // Required when sending a .zip file
    Runtime: Runtime.nodejs18x, // Required when sending a .zip file
  });

  return lambda.send(command);

};

const updateFunction = async ( fname, bucket, key)=>{

  const command = new UpdateFunctionCodeCommand({
    FunctionName: fname,
    S3Bucket: bucket,
    S3Key: key,
    Publish:false,
  });

  return lambda.send(command);


};



const createAlias = (alias)=>{

  const command = new CreateAliasCommand({
    FunctionName: 'helloworld', /* required */
    FunctionVersion: '1', /* required */
    Name: alias, /* required */
    Description: 'Live function',
  });
  return(lambda.send(command));
};

const updateAlias = (alias, version)=>{

  const command = new UpdateAliasCommand({
    FunctionName: 'helloworld', /* required */
    FunctionVersion: version, /* required */
    Name: alias, /* required */
    Description: 'Update Alias',
    RoutingConfig: {
      AdditionalVersionWeights: {
        '2': .6
        /* '<AdditionalVersion>': ... */
      }
    }    
  });
  return(lambda.send(command));
};


