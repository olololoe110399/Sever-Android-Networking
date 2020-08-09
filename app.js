const PORT = process.env.PORT || 5000;
const express = require("express");
const mongose = require("mongoose");
const bodyParser = require("body-parser");
const Handlebars = require('handlebars')
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')
const exphbs = require('express-handlebars');
const app = express();
const path = require("path");
const fileUpload = require ('express-fileupload');

// configure fileupload
app.use (fileUpload ());


// configure path static
app.use("/public", express.static(path.join(__dirname, "public")));
const rootDir = path.dirname (process.mainModule.filename);
app.use (express.static (path.join (rootDir, 'public')));


// configure body-parser
app.use(bodyParser.json({ limit: "50mb" })); // parse form data client
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));


// configure handlebar
app.engine('handlebars', exphbs({
  defaultLayout: 'main',
  handlebars: allowInsecurePrototypeAccess(Handlebars)
 }));
 app.set('view engine', 'handlebars');


// configure Mongodb
const db = require("./config/keys.js").mongoURI;
//connect to Mongo
mongose
  .connect(db, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB Connected... ");
  })
  .catch((err) => console.log(err));


// Routes
app.use("/api", require("./routes/api.js"));

app.listen(PORT, console.log(`Server started on port ${PORT}`));
// Client id : 413986542344-mi63e0d7pshuqm30sq7j4j5g6ldpfmi9.apps.googleusercontent.com
// Client secret: ma-uOGusxxJN8D9aS-UWymJW
// Authorization code:  4/2gG04qJ4nMRO6O4bgUu_EIfqHD0mQmtRNyFBoEyT_pBwM34FlLY3Ilz1U4s5xxHuBMVsswtfKrXWdQo4JHxGrpk
// refresh token: 1//04zDdscNVTXPCCgYIARAAGAQSNwF-L9IrmwOswpKvFmNlxi1BAKcUlGOpRDpznFEr6QEpHwwV6jl06EEcJByx6UxTeUkzMxL6UiQ
// access token : ya29.a0AfH6SMAErffrtURv6xeFtksE0RGqvbPIYC3csTsYGndj6J5XNZE8ehzlZTGHDCFojozN5jxh4NI2T98agEQKMA7hJnNVLf8tEtqSfLwn7qE8x-mwZEFzz9WwGRDvgnMven0mWWJwDzXS0c5QwnPKH3NIQVi4QoY_kk8