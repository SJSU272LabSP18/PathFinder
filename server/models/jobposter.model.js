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
    username: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    title: {type: String},
    company: {type: String},
    logourl: {type: String},
    summary: {type: String},
    description: {type: String},
    city: {type: String},
    state: {type: String},
    persona: {type: String},
    industry: {type: String},
    skills: [{
        text: String,
        value: String
    }],
    perks: [{
        text: String,
        value: String
    }],
    skill_gap: [{
        skill: String,
        trainings: [{'title': String, 'link': String}]
    }],
    emotionalSlider: {type: Number},
    extrovertSlider: {type: Number},
    unplannedSlider: {type: Number},
    orgSlider: {type: Number},
    growthSlider: {type: Number},
    challengeSlider: {type: Number},
    noveltySlider: {type: Number},
    helpSlider: {type: Number}
});

module.exports = mongoose.model('Jobposter', questionsSchema);
