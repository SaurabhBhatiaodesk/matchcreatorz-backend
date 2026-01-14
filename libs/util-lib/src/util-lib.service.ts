import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ResponseSuccess } from 'common/dto';
import { FileType } from 'common/enums';
import { randomString } from 'common/utils';
import { UploadFilesDto } from './dto';

@Injectable()
export class UtilLibService {
  async generateS3PresignedUploadUrls(uploadFilesDto: UploadFilesDto) {
    const { location, type, count } = uploadFilesDto;
    const accessKeyId = process.env.AWS_S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY;
    const region = process.env.AWS_S3_REGION;
    const bucket = process.env.AWS_S3_BUCKET;
    const folder = process.env.AWS_S3_FOLDER;
    // s3 configuration
    const isDevelopment = process.env.NODE_ENV === 'DEVELOPMENT';
    const s3Config = {
      region,
      apiVersion: '2006-03-01',
      signatureVersion: 'v4',
      ...(isDevelopment && {
        accessKeyId,
        secretAccessKey,
      }),
    };
    const s3 = new S3(s3Config);
    const S3_BASE = `https://${bucket}.s3.${region}.amazonaws.com`;
    const expirySeconds = 3600; // URL expiry time in seconds
    // generate keys according to files count
    const objectKeys = Array.from({ length: count }, () => {
      if(folder){
        const key = `${folder}/${location}/${randomString()}.${FileType[type]}`;
        return key;
      }else{
        const key = `${location}/${randomString()}.${FileType[type]}`;
        return key;
      }
    });

    // create presigned urls for upload files
    const promises = objectKeys.map(async (objectKey) => {
      const params = {
        Bucket: bucket,
        Key: objectKey,
        Expires: expirySeconds,
        ContentType: 'application/octet-stream', // Specify the content type of the file
        ACL: 'public-read', // Set the ACL (access control list) for the object
      };
      const url = await s3.getSignedUrlPromise('putObject', params);
      return {
        url,
        preview: `${S3_BASE}/${objectKey}`,
        filename: objectKey,
      };
    });
    return new ResponseSuccess('', await Promise.all(promises));
  }
}
