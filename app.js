const bodyParser = require("body-parser");
const express = require("express")
const mongoose = require("mongoose")
const app = express()
const ejs = require("ejs")

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.json()) //to get coordinate working in JSON format

app.set('view engine', 'ejs');

//****************************mongoBD connections*************************
mongoose.connect("mongodb://localhost:27017/locationDB", {
  useNewUrlParser: true
});

//*******************************schema*********************************
const locationSchema = new mongoose.Schema({
  longitude: Number,
  latitude: Number,
  capacity: Number
});

//*****************************model*****************************
const LocationDB = mongoose.model("Location", locationSchema);



app.listen(3000, function() {
  console.log("okee");
})

//********************************get requests**********************************
app.get("/", function(req, res) {
  LocationDB.find(function(err, locations) {
    if (!err) {
      res.render("index", {
        locations: locations
      });
    } else {
      console.log(err);
    }
  })
})
var arr_lon=[]
var arr_lat=[]
app.get('/chart',(req,res)=>{
  // LocationDB.find({},(req,res)=>{
  //   console.log(res);
  // });
  LocationDB.find(function(err,locations){
    if(err){
      console.log(err);
    }else{
      locations.forEach(function(location){
        //console.log(location);
        arr_lon.push(location.longitude);
        arr_lat.push(location.latitude);
      })
    }
    console.log(arr_lat[0]);
  })

})
//*******************************post requests**********************************
app.post("/offer", function(req, res) {
  // console.log(req.body);
  const data = new LocationDB({
    longitude: req.body.lon,
    latitude: req.body.lat
  })

  data.save(function(err, ans) {
    console.log(ans);
  })
  res.redirect("/");
})
// function deg2rad(deg) {
//   return deg * (Math.PI/180)
// }



app.post("/request",function(req, res) {
  // function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2)
  // console.log(req.body);
  let lat1 = req.body.lat;
  let lon1 = req.body.lon;
  LocationDB.find(function(err,locations){
    locations.forEach(function(location){
      let lat2 = location.longitude
      let lon2 = location.latitude
      // console.log(lat1);
      // console.log(lon1);
      var R = 6371; // Radius of the earth in km
      var dLat = (lat2 - lat1)*(Math.PI/180); // deg2rad below
      var dLon = (lon2 - lon1)*(Math.PI/180);
      //console.log(dLat);
      var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1)*(Math.PI/180)) * Math.cos((lat2)*(Math.PI/180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      var d = (R * c)%R; // Distance in km
      console.log("dist: "+d);
    })
  })
  res.redirect("/")
})
