//powershell Compress-Archive s3-list.mjs s3-list.zip -Update
//zip s3-list.zip s3-list.mjs
//aws s3api put-object --region us-east-1 --bucket aws.smalltowns.com --key code/s3-list.zip --body c:\projects\aws\aws.smalltowns\code\camiri\sdk\s3-list.zip --tagging 'action=create&fname=camiri-list-buckets&role=arn:aws:iam::542798213103:role/CamiriRole&handler=s3-list.handler'

import { S3Client, ListBucketsCommand }  from "@aws-sdk/client-s3";
const s3 = new S3Client({ region: "us-east-1" }); // replace "us-east-1" with your AWS region

export const handler = async function(event)
{
  console.log('List Buckets')  ;
  const command = new ListBucketsCommand({});
  const response = await s3.send(command);
  return {version:1, buckets:response.Buckets};
};