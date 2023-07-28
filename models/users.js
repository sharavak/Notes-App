const mongoose=require('mongoose');
const passportLocalMongoose=require('passport-local-mongoose');
let UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true, 
        unique: true,
    },
    username: {
        type: String,
        required: true,
    },
    profilePic: {
        type: String,
        default: "https://i.ibb.co/VH0zJyh/OIP-KUr2fd-Yr-Sdft-Lgds-Py8u-BAHa-Ha-w-215-h-215-c-7-r-0-o-5-pid-1.jpg",
    },
    bio: {
        type: String,
        default: "",
    }, 
});
UserSchema.plugin(passportLocalMongoose, {
 usernameUnique: false,
usernameField: 'email',
});
let User = mongoose.model('User', UserSchema);
module.exports = User;