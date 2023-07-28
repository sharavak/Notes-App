if (process.env.Node_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const app = express();
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const MongoDBStore=require('connect-mongo');
const User = require('./models/users');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const UserRoutes=require('./routes/users');
const NoteRoutes=require('./routes/notes');
const axios=require('axios');
const multer=require('multer');
const upload=multer()
let FormData=require('form-data');
const middleware=require('./middleware');
const mongoSanitize = require('express-mongo-sanitize');

const dbUrl =process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
    console.log('Database Connected')
})


const secret=process.env.SECRET||'thishouuldbebettersecret!'
const store = new MongoDBStore({
    mongoUrl: dbUrl,
    secret,
    touchAfter:24*60*60    
})
store.on('error', function (e) {
    console.log('Session Store Error',e)
})
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {   
        httpOnly:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'))

app.use(express.urlencoded({extended:true})) 
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')))
app.use(mongoSanitize({
    replaceWith: '_'
}))

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use( async(req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error=req.flash('error');
    if (req.isAuthenticated()) {
        const user=await User.findById(req.user._id);
        res.locals.profileImage=user.profilePic;
    }else
        res.locals.profileImage=req.image || 'https://i.ibb.co/VH0zJyh/OIP-KUr2fd-Yr-Sdft-Lgds-Py8u-BAHa-Ha-w-215-h-215-c-7-r-0-o-5-pid-1.jpg'
    next(); 
});


app.get('/', function (req, res) {
    console.log(req.user,req.sessionID,req.originalUrl,req.path);
    res.render('notes/home');
});
app.get('/profile',middleware.isLoggedIn,async function (req, res) {
    const user=await User.findById(req.user._id);
    res.render('notes/profile',{user});
});
app.use('/', UserRoutes);
app.use('/', NoteRoutes);
app.use('/:id', NoteRoutes);

app.post('/profile',middleware.isLoggedIn,upload.single('profilePic') ,async function (req, res) {
    const { profilePic, bio, username }=req.body;
    const user=await User.findById(req.user._id);
    if (req.file) {
        let formData=new FormData();
        formData.append('image', req.file.buffer.toString('base64'));
        let apiKey=process.env.APIKEY;
        let url=`https://api.imgbb.com/1/upload?key=${apiKey}`;
        console.log(req.user._id);
        try {
           let  data=await axios({
                method: 'post',
                url: url,
                headers: formData.getHeaders(),
                data: formData
            })
            data=await data.data;
            user.bio=bio;
            user.username=username;
            user.profilePic=data.data.thumb.url;
            req.image=data.data.thumb.url;
            await user.save();
            req.flash('success', 'Profile Updated!');
            res.redirect('/show');
        } catch (e) {
            req.flash('error', 'Error in updating the profile!!!');
            res.redirect('/show');
        }
    } else {
        user.bio=bio;
        user.username=username;
        await user.save();
        req.flash('success', 'Profile Updated!');
        res.redirect('/show'); 
    }
});

const port=process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})
