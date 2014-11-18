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
    db.collection('comments', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.comment = function(req, res){
    var url = decodeURIComponent(req.params.url);
    console.log('Retrieving comment: ' + url);
    db.collection('comments', function(err, collection) {
        collection.findOne({'object': url},function(err, items) {
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.write(JSON.stringify(items));
            res.end();
        });
    });
};

