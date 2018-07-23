var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
var request = require("request");
var app = express();
var fs = require('fs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

/*
var txt = "";
var bing = require('bingspeech-api-client');
var wave = fs.createReadStream(__dirname + '/example.wav');
var client = new bing.BingSpeechClient('51b4ad00f58b46ada4d7ec78e859904b');
client.recognizeStream(wave)
.then(response => {console.log(response.results[0].name); txt = response.results[0].name;
    var client1 = new bing.BingSpeechClient('51b4ad00f58b46ada4d7ec78e859904b');
    client1.synthesize(txt).then(result => {
        var file = path.join(__dirname, '/bingspeech-api-client.wav');
        var wstream = fs.createWriteStream(file);
        wstream.write(result.wave);
        console.log('Text To Speech completed. Audio file written to', file);
      });
});

console.log(txt);
*/

app.get('/textparse', function(req, res) {
     var text = req.query.text.replace(/ /g, '+');
     var actualText = req.query.text;
     //var responded = "";
     request('https://api.textgears.com/check.php?text='+text+'&key=NZO5Bxcko5M9CLyE', { json: true }, (err, response, body) => {
        if (err) { return console.log(err); }
        var responded = JSON.stringify(body);
        //PARSE FUNCTION
        var noOfErrors = body.errors.length;
        //var correctText = "";
        console.log(noOfErrors);
        //var offset = 0;
        //var length = body.errors[0].length;

        for (var index = 0; index < noOfErrors; index++) {    
          
            /*var nextOffset = body.errors[index].offset;
            var nextLength = body.errors[index].length;
            var nextBetter = body.errors[index].better[0];
            */
            var better = body.errors[index].better[0];
            var bad = body.errors[index].bad;
            actualText = actualText.replace(bad, better);

            /*if(index == 0) {
                correctText = actualText.substring(0, offset);
            }
            correctText = 
            */
            /*
            if(index == noOfErrors - 1) {
                correctText = correctText + actualText.substring(offset + length, actualText.length);
            }*/

        }

        res.send(actualText);
        //console.log(response);
      });
      //res.send(responded);
});

app.listen(3000, function() {
    console.log("Server started at port 3000");
})