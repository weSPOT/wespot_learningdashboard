/* ****************************************************************************
 * Copyright (C) 2014 KU Leuven
 * <p/>
 * This library is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * <p/>
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * <p/>
 * You should have received a copy of the GNU Lesser General Public License
 * along with this library.  If not, see <http://www.gnu.org/licenses/>.
 * <p/>
 * Contributors: Sven Charleer
 * *************************************************************************** */

var db = require('../dbConnection.js').db;

exports.list = function(req, res){
    db.collection('events', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.username = function(req, res){
    var username = req.params.username;
    ////console.log('Retrieving event: ' + username);
    db.collection('events', function(err, collection) {
        collection.find({'username': username}).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.username_verb = function(req, res){
    var username = req.params.username;
    var verb = req.params.verb;
    ////console.log('Retrieving event: ' + username + " " + verb);
    db.collection('events', function(err, collection) {
        collection.find({'username': username, 'verb': verb}).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.verb = function(req, res){
    var verb = req.params.verb;
    ////console.log('Retrieving event: ' + verb);
    db.collection('events', function(err, collection) {
        collection.find({'verb': verb}).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.starttime = function(req, res){
    var starttime = req.params.starttime();
    ////console.log('Retrieving event: ' + starttime);
    db.collection('events', function(err, collection) {
        collection.find({'starttime': starttime}).toArray(function(err, items) {
            res.send(items);
        });
    });
};

