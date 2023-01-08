const express = require('express');
const multer = require('multer');
const vision = require('@google-cloud/vision');
var cors = require('cors');
const app = express();
app.use(cors());
app.set('trust proxy', true);
const port = process.env.PORT || 8080;
const path = require('path');

let newFileName;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './upload');
  },
  filename: (req, file, cb) => {
    console.log(file);
    newFileName = Date.now() + path.extname(file.originalname);
    cb(null, newFileName);
  }
});

// console.log(storage.filename);

const upload = multer({storage: storage});

app.get('/health', (req, res) => {
  res.type = "application/json";
  res.send({ message: ' Vision API working successfully...Go ahead and upload some photos' });
});

/**
 * The google API starts from here
 */
const CREDENTIALS =  JSON.parse(JSON.stringify({
  "type": "service_account",
  "project_id": "object-identifying-api",
  "private_key_id": "f67795a09f7ac2af6d6e6a0601700e4fc3e025a1",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCZFm6rsw+7UWP1\ntlEQzCszSbZUv/eZ9nyqyqH/3vu3cYasVcNXirQTuPTfTOI4jddj5V9px48wynn2\nrkxNorL2w6Dpw7hqMWBix7SHm9ssh9x+KvXVKALzeqjnP2aAGYtIov5pmCkwx44X\nB/9xmbVCnUvf2YvBvzlVE45xL/yDKq8Plez4ut0EjqLcOpyp6/TQXwUvPQzxplw7\no6akFJJzwQz1L+FTy7y6ozspo9anwGAkXr+9UNCeEmMchfjeXsc5aXaTFwg5PBTj\nicXsOso6hJXuBqIkzUUObhjUNTcANZi3FwDQ/hRQA1xwBVxI8gQoR7B/lhi3elqR\nJekYIwdLAgMBAAECggEAHinWWoxokB8EVBi9NlMUPAHNJDvC3Jo9jCVq8BCOhmGf\nCHvJhok03CH4Vbs/Y6dHBk7ekugYJaPvjhRfwnhJTOfU39qJjpr2A+CXiJTEBa0r\nW8y5LWu50SGdABt05c6irAg5mrK5gvv+2jjgMxD3Lw3xMkUaDW3RLRsyWMj8txc2\n46tmfs9h5P7I0U7+7ZPBO/bL2x+vb9ygHe9crYpLX972MhQFSzRtOQviNg+TCmZa\nUO44SclAdiNYmUaBa4ShrCHtcJXRd6IQZuqx2s5CIPgKEez8GnsQq7xhQr5KHgSd\nebK83uCnRH89Sle/g2Rk76ys2lOocY/h7ytw9XfYeQKBgQDMXD9R7sK2LnBDUU8U\n6Bs1p/GnVBtTRyF90CEofqod8io5lGoH1KPTHnHNpSAu0nxHzxBCPeMXr7kWH9B7\neAYRVqUmTgwjN4bpgJt/GPofF2PcQRebXVF9Cld2P3WWbo5uUVc9YAvhmxSSzEgk\n7AUpAC4Hw5g508f1pc0Usjc9bwKBgQC/xW7J8NBZV8zbSdGI+ZHOXodrk5KY+9Ht\n0BeaqAsPGR/qBHGQ898B8iHcLome87WZRPC7yamWw87oYgM1tlHJrQJp8+TPShQC\n8aELBexLcAF6+ER9zJhThz/fAVGuPfofli1iYr2y2ju7jWVGhrzpqstR9dnGH6k0\nlcFOBrSd5QKBgQCwSjeZX2V6sW7Is6CLwXqPe9Q765My8N6UYPHps/LeqGQCjeQ1\n4xp76fx0USkFGzB45cf5zNdVPJJm4oT/rddWJ6+J7rQLwT/RuM7rAknqfkv32fMa\nZJMCUeSHLlEqty6JPgQK/wrg0N4bkLv/ldcRuoT6z6FG6UnKv/+9BcwfYwKBgQCt\nWSGZh4Y+jKBQRT0UTUyguFA/TQmCIneUObtsgKRmhHaVymiB+ABJOP+kkaizN2eb\nYXceuN8EuoFJDHgMUH9EB5EcB2x4eGT4eETzuunrExczekInWQ8EykhRJFcaY0m6\nzby+p7UEfELseZbnlpojutDJiKvPbQU91HUFPAh+hQKBgBmd3DN/bdWC8q525nHo\n48xLw6JlHX397xnGiRcxCmdXDytO4FNlxIEod/aErAH1g4UG+fbeS8FxACY1o7zX\nbphF17R2ndrfC08IWL03L2qIz6tS0qXU7O3feVkCYMbjqyoW0/vOHuig9bjBrdNn\nCsbZhfIEI8zeJy+7gM2k0Sfd\n-----END PRIVATE KEY-----\n",
  "client_email": "my-service-account@object-identifying-api.iam.gserviceaccount.com",
  "client_id": "108781401413114111220",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/my-service-account%40object-identifying-api.iam.gserviceaccount.com"
}
));

const CONFIG = {
  credentials: {
    private_key: CREDENTIALS.private_key,
    client_email: CREDENTIALS.client_email
  }
};

const detectObjects = async(filePath=`./upload/${newFileName}`) => {
  const client = new vision.ImageAnnotatorClient(CONFIG);
  const [result] = await client.labelDetection(filePath);
  const labels = result.labelAnnotations;
  // return labels.forEach(label => console.log(label.description));
  let lableDescriptionArray = [];
  labels.forEach(label => lableDescriptionArray.push(label.description));
  return lableDescriptionArray;
}

app.post('/upload', upload.single("image"), async (req, res) => {
  const data = await detectObjects().then((data) => data);
  res.type = "application/json";
  await res.send(data);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});