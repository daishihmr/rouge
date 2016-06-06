var AWS = require("aws-sdk");
var s3 = new AWS.S3({
  accessKeyId: "AKIAIMDOG73XEZEBL4MQ",
  secretAccessKey: "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",
  region: "ap-northeast-1",
});
var fs = require("fs");
var mimeTypes = require("mime-types");
var ignores = [
  ".git",
  "node_modules",
  "sozai",
  "phigl",
  ".gitignore",
  ".gitmodules",
  "gulpfile.js",
  "package.json",
  "upload.js",
];

var upload = function(file) {
  return new Promise(function(resolve, reject) {
    var key = file.replace("./", "");
    fs.readFile(file, function(err, data) {
      if (err) {
        reject(err);
      } else {
        console.log("upload " + file + " start");
        s3.upload({
          Bucket: "rouge.dev7.jp",
          Key: key,
          ACL: "public-read",
          ContentType: mimeTypes.lookup(key) || "application/octet-stream",
          Body: data,
        }, function(err, result) {
          if (err) {
            reject(err);
          } else {
            console.log(result);
            resolve(result);
          }
        });
      }
    });
  });
};

var p = [];
var scan = function(folder) {
  if (ignores.some(function(value) {
      return folder.endsWith(value);
    })) {
    return;
  }

  fs.readdirSync(folder).map(function(c) {
    if (ignores.indexOf(c) > 0) return;

    var stat = fs.statSync(folder + "/" + c);
    if (stat.isFile()) {
      p.push(upload(folder + "/" + c));
    } else if (stat.isDirectory()) {
      scan(folder + "/" + c);
    }
  });
};

scan(".");

Promise.all(p)
  .then(function() {
    console.log("ok");
  })
  .catch(function(err) {
    console.log(err);
  });
