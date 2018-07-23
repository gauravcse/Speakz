var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
var request = require("request");
var app = express();
var fs = require('fs');
var bing = require('bingspeech-api-client');
const ffmpeg = require('fluent-ffmpeg');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));


/*
var bing = require('bingspeech-api-client');
var wave = fs.createReadStream(__dirname + '/example.wav');
var client = new bing.BingSpeechClient('51b4ad00f58b46ada4d7ec78e859904b');
client.recognizeStream(wave)
.then(response => {console.log(response.results[0].name); var txt = response.results[0].name;
    var client1 = new bing.BingSpeechClient('51b4ad00f58b46ada4d7ec78e859904b');
    client1.synthesize(txt).then(result => {
        var file = path.join(__dirname, '/bingspeech-api-client.wav');
        var wstream = fs.createWriteStream(file);
        wstream.write(result.wave);
        console.log('Text To Speech completed. Audio file written to', file);
      });
});*/

app.get('/audioparse', function(req, res) {
    var audioPath = __dirname + '\\' + req.query.audio + '.wav';
    var savePath = req.query.save + '.wav';
    //STT
    var wave = fs.createReadStream(audioPath);
    var clientSTT = new bing.BingSpeechClient('51b4ad00f58b46ada4d7ec78e859904b');
    clientSTT.recognizeStream(wave)
    .then(response => {console.log(response.results[0].name);
        var incorrectText = response.results[0].name;
        request('https://api.textgears.com/check.php?text='+incorrectText+'&key=NZO5Bxcko5M9CLyE', { json: true }, (err, response, body) => {
            if (err) { return console.log(err); }
            var responded = JSON.stringify(body);
            
            var actualText = incorrectText;
            //PARSE FUNCTION
            var noOfErrors = body.errors.length;
            for (var index = 0; index < noOfErrors; index++) {    
                  var better = body.errors[index].better[0];
                  var bad = body.errors[index].bad;
                  actualText = actualText.replace(bad, better);
            }

            console.log(actualText);
            //console.log(response);
            var clientTTS = new bing.BingSpeechClient('51b4ad00f58b46ada4d7ec78e859904b');
            clientTTS.synthesize(actualText).then(result => {
                var file = path.join(__dirname, savePath);
                var wstream = fs.createWriteStream(file);
                wstream.write(result.wave);
                console.log('Text To Speech completed. Audio file written to', file);
              });
        });   
        
    });
});


app.get('/videoparse', function(req, res) {

    let track = path.join(__dirname, req.query.input) + '.mp4';

    ffmpeg(track).setFfmpegPath('C:\\Users\\Gaurav Mitra\\Desktop\\Project\\Speakz\\FFMPEG\\bin\\ffmpeg.exe').toFormat('wav') .on('error', (err) => {
        console.log('An error occurred: ' + err.message);
    })
    .on('progress', (progress) => {
        console.log('Processing: ' + progress.targetSize + ' KB converted');
    })
    .on('end', () => {
        console.log('Processing finished !');
    })
    .save(path.join(__dirname, req.query.output) + '.wav');

});


app.get('/textparse', function(req, res) {
     var text = req.query.text.replace(/ /g, '+');
     //var responded = "";
     request('https://api.textgears.com/check.php?text='+text+'&key=NZO5Bxcko5M9CLyE', { json: true }, (err, response, body) => {
        if (err) { return console.log(err); }
        var responded = JSON.stringify(body);
        //PARSE FUNCTION
        res.send(responded);
        //console.log(response);
      });
      //res.send(responded);
});

app.listen(3000, function() {
    console.log("Server started at port 3000");
})