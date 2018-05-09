'use strict';

/********************************
 Dependencies
 ********************************/
var mongoose = require('mongoose'),
    bcrypt = require('bcrypt');

/********************************
 Create User Account Schema
 ********************************/
var questionsSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    persona: {type: String, required: false, default: "intern"},
    industry: {type: String, required: false, default: "software_engineering"},
    q1: {type: String, default: ""},
    q2: {type: String, default: ""},
    q3: {type: String, default: ""},
    q4: {type: String, default: ""},
    q5: {type: String, default: ""},
    q6: {type: String, default: ""},
    emotional: { type: Number, default: 0 },
    extrovert: { type: Number, default: 0 },
    structure: { type: Number, default: 0 },
    curiosity: { type: Number, default: 0 },
    challenge: { type: Number, default: 0 },
    novelty: { type: Number, default: 0 },
    help: { type: Number, default: 0 },
    perks: [{
        id : String,
        perk : String,
        checked: Boolean

     }],
    experience: [{
       id: Number,
       company : String,
       description : String,
       role: String,
       startdate: String,
       enddate: String,
    }],
    education: [{
       id: Number,
       degree : String,
       institute : String,
       description: String,
       startdate: String,
       enddate: String,
    }],
    skills: [{
        text: String,
        value: String
    }],
    ranking: { type: Number, default: 0}
});

module.exports = mongoose.model('Jobseeker', questionsSchema);
