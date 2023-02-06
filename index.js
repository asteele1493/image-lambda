import {S3Client, GetObjectCommand, PutObjectCommand} from '@aws-sdk/client-s3';

export const handler = async(e) => {

const s3Client = new S3Client({region: "us-west-2"});

const bucket = "cf-steele-image-bucket";

const s3SummaryParams = {
        Bucket: bucket, 
        Key: "summary.json"
    };


    //tells us the S3 information in the event.
    //GET new file name from trigger
    console.log("handler event", JSON.stringify(e, undefined, " "));
    const imageUploaded = e.Records[0].s3.object.key;
    
    
    //GetObject{bucket}/summary.json
    let summaryJson;
    try{
        summaryJson = await s3Client.send(new GetObjectCommand(s3SummaryParams));
    } catch (e){
        console.warn("error getting summary.json", e);
        summaryJson = "[]";
    }
    const summary = JSON.parse(summaryJson);
    
    //Append new file to summary
    
    summary.push(imageUploaded); //TODO: USE A BETTER DATA MODEL THAT HAS A FULL URL.
    
    //PutObject JSON.stringify{summaryData} to {bucket}/summary.json
    
    const updatedSummaryJson = JSON.stringify(summary, undefined, " ");
    console.log("updated summary JSON", updatedSummaryJson);
    
    try{
    await s3Client.send(new PutObjectCommand({
       ...s3SummaryParams,
        Body: updatedSummaryJson,
        ContentType: "application/json" 
        //For JSON, it's always this content type
    }));
    } catch (e) {
        console.warn('Failed to put summary', e);
    }
    
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "updated summary.json",
            summary
        })
    };
};
