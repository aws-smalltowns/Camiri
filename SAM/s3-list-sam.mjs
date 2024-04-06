//sam package --template-file sam-template-lambda.yml --output-template-file package.yml --s3-bucket aws.smalltowns.com --s3-prefix sam
//sam deploy --template-file package.yml --stack-name Camiri-Sam --capabilities CAPABILITY_IAM

import { S3Client, ListBucketsCommand }  from "@aws-sdk/client-s3";
const s3 = new S3Client({ region: "us-east-1" }); // replace "us-east-1" with your AWS region

export const handler = async function(event)
{
  console.log('SAM Code Deploy');
  console.log('version 1');
  const command = new ListBucketsCommand({});
  const response = await s3.send(command);
  return {version:1, buckets:response.Buckets};
};