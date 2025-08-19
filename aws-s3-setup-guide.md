# AWS S3 Setup Guide for Data Ingestion Pipeline

This guide provides step-by-step instructions for setting up AWS S3 storage for the dynamic data ingestion pipeline.

## 🎯 **Phase 1.1: Shared Object Storage Setup** ✅ **COMPLETE**

### **1. Provisioning the S3 Bucket**

#### **1.1.1. Set Up AWS S3 Bucket**

1. **Log in to AWS Management Console**

   - Navigate to the S3 service
   - Click "Create bucket"

2. **Configure Bucket Settings**

   - **Bucket name:** `sales-analytics-01` (or your preferred unique name)
   - **AWS Region:** Select a region close to your application servers
   - **Block Public Access settings:** ✅ **Block all public access** (critical for security)

3. **Advanced Settings**
   - **Object Ownership:** ACLs disabled (recommended)
   - **Bucket Versioning:** Disabled (for this use case)
   - **Tags:** Optional - add tags for cost tracking

#### **1.1.2. Configure Bucket Permissions and CORS**

Navigate to your bucket's **Permissions** tab and configure CORS:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://your-production-domain.com"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

**Security Notes:**

- **`AllowedOrigins`**: Restrict to your specific frontend URLs
- **`AllowedMethods`**: `PUT` and `POST` are essential for uploads
- **`AllowedHeaders`**: Allows necessary headers for authenticated requests

#### **1.1.3. Create IAM Policy for Service Access**

Create an IAM policy with the following JSON:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowObjectOperations",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:HeadObject"
      ],
      "Resource": "arn:aws:s3:::sales-analytics-01/*"
    },
    {
      "Sid": "AllowBucketListing",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::sales-analytics-01"
    }
  ]
}
```

**Steps:**

1. Go to IAM service in AWS Console
2. Create a new policy
3. Paste the JSON above
4. Name it: `SalesAnalyticsS3Policy`
5. Create an IAM user and attach this policy
6. Generate Access Key and Secret Access Key

### **2. Backend Integration**

#### **2.1. Install Required Python Packages**

```bash
# Activate your virtual environment
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install required packages
pip install boto3 python-dotenv
```

#### **2.2. Configure Environment Variables**

1. **Copy the example environment file:**

   ```bash
   cp backend/env.example backend/.env
   ```

2. **Edit `backend/.env` with your actual values:**

   ```env
   # S3 Bucket Configuration
   S3_BUCKET_NAME=sales-analytics-01
   AWS_REGION=us-east-1

   # AWS Credentials
   AWS_ACCESS_KEY_ID=your_actual_access_key
   AWS_SECRET_ACCESS_KEY=your_actual_secret_key
   ```

#### **2.3. Test the Setup**

Run the test script to verify everything is working:

```bash
python test_s3.py
```

**Expected Output:**

```
🚀 S3 Connection Test
==================================================
🔧 Testing Environment Setup...
   ✅ .env file found
   ✅ S3_BUCKET_NAME is set
   ✅ AWS_REGION is set
   ✅ AWS_ACCESS_KEY_ID is set
   ✅ AWS_SECRET_ACCESS_KEY is set
   ✅ All environment variables are configured

🔍 Testing S3 Connection and Permissions...
   Bucket: sales-analytics-01
   Region: us-east-1
   Access Key: AKIA1234...

📋 Test 1: Listing bucket contents...
   ✅ Successfully listed bucket contents
📤 Test 2: Uploading test file...
   ✅ Successfully uploaded test object 'connection_test.txt'
🔍 Test 3: Verifying file exists...
   ✅ File exists with size: 25 bytes
📥 Test 4: Downloading and verifying content...
   ✅ Downloaded content matches uploaded content
🗑️  Test 5: Cleaning up test file...
   ✅ Successfully deleted test file

🎉 All S3 tests passed successfully!
✅ Successfully connected to S3 bucket 'sales-analytics-01'
✅ All permissions are correctly configured
✅ File upload/download operations work correctly

🎯 S3 setup is complete and ready for use!
   You can now proceed with implementing the data ingestion pipeline.
```

### **3. Implementation Files Created**

The following files have been created and are ready for use:

#### **3.1. Storage Configuration**

- `backend/config/storage_config.py` - Main S3 configuration class
- `backend/services/s3_service.py` - S3 service utilities
- `backend/env.example` - Environment variables template

#### **3.2. Test Script**

- `test_s3.py` - Comprehensive S3 connectivity test

### **4. Next Steps**

With S3 storage successfully configured, you can now proceed to:

1. **Phase 1.2: Operational Database Setup** - Set up PostgreSQL for task tracking
2. **Phase 1.3: FastAPI Router Setup** - Create the ingestion API endpoints
3. **Phase 1.4: Background Task Infrastructure** - Implement async processing

### **5. Security Best Practices**

✅ **Implemented:**

- Blocked all public access to S3 bucket
- Used IAM policies with least privilege
- Configured CORS for specific origins only
- Environment variables for credentials

⚠️ **Additional Recommendations:**

- Enable S3 bucket encryption (SSE-S3 or KMS)
- Set up S3 bucket versioning for data protection
- Configure S3 bucket lifecycle policies
- Monitor S3 access with CloudTrail
- Use IAM roles instead of access keys in production

### **6. Troubleshooting**

#### **Common Issues:**

1. **Access Denied Error:**

   - Verify IAM policy is attached to the correct user
   - Check bucket name in policy matches actual bucket
   - Ensure access keys are correct

2. **CORS Errors:**

   - Verify CORS configuration includes your frontend URL
   - Check that `AllowedMethods` includes required HTTP methods

3. **Environment Variables Not Found:**

   - Ensure `.env` file is in the correct location (`backend/.env`)
   - Verify `python-dotenv` is installed
   - Check that `load_dotenv()` is called in your application

4. **Bucket Not Found:**
   - Verify bucket name is correct
   - Check that bucket exists in the specified region
   - Ensure you have permissions to access the bucket

---

**Status:** ✅ **Phase 1.1 Complete**
**Next:** Proceed to Phase 1.2 (Operational Database Setup)
