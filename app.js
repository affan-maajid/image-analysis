/*
All user stories from iteration 1 & 2 implemented here:
1. As a customer, I want the app to use IBM Watson machine learning services for image recognition and text to
speech conversion.

2. As an app user, I want to upload an image through a webpage.

3.  As an app user, I want the page to get a confirmation of the upload process.

4. As an app user, I want to get the number of faces in the uploaded image.

5. As an app user, I want to get the gender of each face.

6. As an app user, I want to get the average age of each face.

7. As an app user, I want to be able to listen to an audio speech represents the data in stories 4,5, and 6.

8. As an app user, I want to be able to upload and get results several times

9. As an app user, I want to see the input image on my client side

10. As an app user, I want to see the output image on my client side surrounded by a bounding box

The flow of the code is sub-divided into:
-Library required
-Global variables assignment
-Get number of faces function
-Get gender of each face function
-Get average age of each face function
-Text to speech function
-Get face coordinate to be sent so that rectangle can be made

NOTE: This project makes use of the IBM Cloud Watson services that will classify the uploaded images in real-time.

  */


/*
The following lines of codes deal with importing libraries that will be used to:
-Allow the visual recognition
-Allow text to speech conversion
-Allow acquisition of uploaded image by user
 */

const express = require('express');
//const server = require('http').createServer(app);

//(server)
const SocketIOFileUpload = require("socketio-file-upload");
const VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
const fs = require('fs');


const winston = require('winston');

const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.File)({ filename: 'log/results.log' })
    ]
});


const visualRecognition = new VisualRecognitionV3({
    version: '2018-03-19',
    api_key: 'd95d79cabb976390451c12efc788aa5ea3a90b4c'
});


const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');

const text_to_speech = new TextToSpeechV1 ({
    username: '8c5a1822-e2ac-4e72-ad23-cdbae5339e85',
    password: 'aSxJJptdlpQ4'
});



/*
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});
*/
const app = express()
    .use(SocketIOFileUpload.router)
    .use(express.static(__dirname + "/"))
    .listen(3000, function() {
        console.log("Listening on port 3000");
        logger.info('Express app operational. Client page served.');
    });


const io = require('socket.io')(app);


//The following lines of codes deal with assigning global variables

let audioNum = 1;
let image_count = 0;
let gStatement = '';
let faceLocArray = [];


/*
The following lines of codes deal with uploading and saving image:
-Client to server image transfer
-if successful,i.e, less than 10Mb, image saved and faceDetect algorithm is applied
-if failure,i.e, more than 10Mb, an event is triggered
User stories 2 & 3 fulfilled on server side here
 */

io.on("connection", function(socket){
    logger.info('SocketIO connection established with client.');
    console.log("Client Connected!");
    const uploader = new SocketIOFileUpload();
    uploader.dir = "C:/Users/Affan/assign5/iteration_2/uploads";
    uploader.listen(socket);

    uploader.maxFileSize = 10000000;

    uploader.on("start", function(event){
        logger.info('Upload started by client');
        console.log("Upload Started");
        console.log(event.file.name);

    });


    uploader.on("complete", function(event){
        logger.info('Image upload complete');
        console.log("Upload Complete");
        console.log(event.file.name);

    });



    // Do something when a file is saved:
    uploader.on("saved", function(event){
        console.log(event.file.success);

        if (!event.file.success){
            logger.info('Error: Client uploaded an image which is larger than 10MB');
            console.log("Client uploaded an image which is larger than 10MB");
        }
        else {
            console.log("File Saved!");
            logger.info('File saved');
            let fileName = event.file.name;
            let currentImagePath = './uploads/' + fileName;
            detectFaces(currentImagePath);
            socket.emit("uploadSuccess", "Upload Successfully Completed!");


        }

    });

    // Error handler:
    uploader.on("error", function(event){
        console.log("Error from uploader: " + event.error);
        logger.info("Error from uploader: " + event.error);
        socket.emit("uploadFail", "Upload Failed!");
    });


    socket.on("inputImageLoaded", function (data) {
        //console.log(data);
       io.emit("drawRect", {faceLocArray: faceLocArray});
    });




});



/*
The function detectFaces gets a JSON object from IBM cloud service that consists of number of faces, face location etc...:
Argument: (one):  imagePath : path of image to be analysed
Precondition: Image size less than 10Mb- ensured by uploader.MaxFileSize
Postcondition: None
Return: A JSON object response containing the information of the image
 */

function detectFaces(imagePath) {
    logger.info('Function detectFaces started');
    let images_file = fs.createReadStream(imagePath);

    let params = {
        images_file: images_file
    };

    visualRecognition.detectFaces(params, function(err, response) {
        if (err) {
            console.log(err);
            logger.info('Watson VisualRecognition returned an error:' + err);
        }
        else {
            logger.info('response object containing face details for the supplied image successfully received from Watson');
            console.log(JSON.stringify(response, null, 2));
            faceAnalysis(response);
        }

    });

}


/*
The function faceAnalysis gets each information that was returned from the faceDetected algorithm into a variable:
Argument: (one):  responseObject : JSON object to be classified
Precondition: DetectFaces function ran without err
Postcondition: None
Return: (one) : resAray : to be used in test.js
This function creates a statement with its template and that is passed to the audioNarration function
User stories 4 fulfilled on server side here
 */



function faceAnalysis(responseObject) {
    logger.info('function faceAnalysis started');
    let totalFaces = responseObject.images[0].faces.length;
    let resArray = [];
    let imgArray = [];
    resArray.push(totalFaces);

    if (totalFaces !== 0) {
        let faces = responseObject.images[0].faces;
        imgArray.push(responseObject.images[0].image);
        let avgAge;
        let gender;
        let faceNum;
        let statement = "The image has " + totalFaces + " faces.";

        let i = 0;

        while (i !== totalFaces) {
            logger.info('loop to calculate average age and gender of each face in the supplied image started');
            faceNum = i + 1;

            imgArray.push(faces[i].face_location);

            avgAge = averageAge(faces[i]);
            //console.log("The average age of face " + faceNum.toString() + " is " + avgAge + " years");
            resArray.push(avgAge);

            gender = faceGender(faces[i]);
            //console.log("The gender of face " + faceNum.toString() + " is " + gender);

            statement = statement + " Face number " + faceNum.toString() + " is a " + gender +
                " and the average age is " + avgAge + " years.";

            i += 1;
        }
        console.log(statement);
        logger.info("Watson image analysis result: " + statement);
        audioNarration(statement);
        faceDetection(imgArray);
        faceLocArray = imgArray;
        gStatement = statement;
        return resArray;
    }
    else {
        console.log("No faces were detected in the image");
        logger.info("Watson image analysis result: No faces were detected in the image");
        gStatement = "No faces were detected in the image";
        audioNarration(gStatement);
        imgArray.push(responseObject.images[0].image);
        faceDetection(imgArray);
        faceLocArray = imgArray;
        resArray.push(0);
        return resArray;
    }

}



/*
The function averageAge calculates the average estimated age of that face:
Argument: (one):  curFace : a face from the totalFaces
Precondition: totalFaces not empty
Postcondition: None
Return: (one) : avgAge : average age of the face
User stories 6 fulfilled on server side here
 */


function averageAge(curFace) {
    logger.info('function averageAge started');
    let avgAge = Math.round((curFace.age.min + curFace.age.max) / 2);
    return avgAge;
}



/*
The function faceGender calculates the gender of the face:
Argument: (one):  curFace : a face from the totalFaces
Precondition: totalFaces not empty
Postcondition: None
Return: (one) : curFace.gender.gender : gender calculation by IBM - Male or Female
User stories 5 fulfilled on server side here
 */


function faceGender(curFace) {
    logger.info('function faceGender started');
    return curFace.gender.gender;

}


/*
The function audioNarration make .wav audio file that will be played on the client side
Argument: (one):  statement : The phrase to be read
Precondition: None
Postcondition: None
Return: (one) : audio file
User stories 5 fulfilled on server side here
 */

function audioNarration(statement) {
    logger.info('function audioNarration started');

    let params = {
        text: statement,
        accept: 'audio/wav'
    };
    let audioPath = './audio/narration' + audioNum + '.wav';

// Pipe the synthesized text to a file.
    text_to_speech.synthesize(params).on('error', function(error) {
        console.log('Error:', error);
        logger.info('Watson Text-to-Speech returned an error: ' + error);
    }).pipe(fs.createWriteStream(audioPath));

    //console.log(statement);

    io.emit("imageAnalysis", {fullAnalysis: statement});
    logger.info('audio narration file of the supplied image analysis created successfully');
    audioNum += 1;
}

/*
The function faceDtection gets the coordinates of where the rectangle will be drawn
Argument: (one):  infoArray : An array having the faces detected
Precondition: None
Postcondition: None
Return: (one) : coordinate of image
 */

function faceDetection(infoArray) {
    logger.info('function faceDetection started');
    io.emit("faceDetection", {imgCoord: infoArray});

}



exports.audioNum = audioNum;
exports.faceAnalysis = faceAnalysis;
exports.averageAge = averageAge;
exports.faceGender = faceGender;
