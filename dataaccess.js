
console.log("DATAACCESS: entering");

var express = require('express');
var app = express();

const mysql = require('mysql');
const url = require('url');

/*
 * Get the real product data from MySQL
 */
app.get('/productlist/:searchstring', function(req, res, next) {
	
	var searchString = req.params.searchstring;
	
	console.log("DATAACCESS: entering route with path=" + searchString);
	

	
	var dataTags = [];
	
	/*
	 * Connect to MySQL
	 */
	var connection = mysql.createPool({
	  connectionLimit: 10,	
	  host     : '35.188.113.158',
	  user     : 'root',
	  password : 'passw0rd',
	  database : 'inventorydatabase'	  
	});
 
 		var queryString = "SELECT productname FROM inventorytable WHERE productname LIKE '%" + searchString + "%'";
 		connection.query(queryString, function(err, rows, fields) {

	
		if (err) {
			console.log('DATAACCESS: Error while performing select= ' + err);
			return;
		}
					
console.log('DATAACCESS:  The solution is: ', rows);

		/* 
		 * Create tags for each available productname
		 */
		for (var i = 0; i < rows.length; i++) {
			var row = rows[i];
	
			dataTags[i] = row.productname;
		}

		connection.end();
			
console.log("DATAACCESS: route returning length=" + dataTags.length + " values=" + dataTags);	

  		res.send(dataTags);
			
	}); /* END of query */
		
//	});	/* END of connect */

}); /* END of app.get /realdata */


/*
 * Return dummy data
 */
app.get('/dummydata', function(req, res, next) {
	
var dataTags = [
	      "ActionScript",
	      "BASIC",
	      "C",
	      "Data Access"
	     ];

console.log("DATAACCESS: route returning=" + dataTags);
	     
  	res.send(dataTags);
});


/*
 * Load data from JSON file into MySql
 */
app.get('/loadproductjson', function(req, res, next) {
	
	/*
	 * GCP bucket holds JSON
	 * https://storage.googleapis.com/autocomplete-demo-174321.appspot.com/bbproduct.json
	 */
	var productjsonurl = "https://storage.googleapis.com/autocomplete-demo-174321.appspot.com/products.json";

	var fetch = require("node-fetch");

	fetch(productjsonurl)
	.then(res => res.json())
	.then((productjson) => {
		
console.log('LOADPRODUCTJSON: json=', productjson);

		var productlist = [];
		var rowcount = productjson.length;
		
		/*
		 * Extract the product names so that they can be inserted into the inventorytable table
		 */
		for (var i = 0; i < rowcount; i++) {
			var product = productjson[i];
	
			productlist[i] = [];
			productlist[i][0] = product.name;
		}	
		
		console.log("LOADPRODUCTJSON: productlist=" + productlist);		

		/*
		 * Insert into the MqSql database
		 */
	
		/*
		 * Connect to MySQL
		 */
		var connection = mysql.createConnection({
		  host     : '35.188.113.158',
		  user     : 'root',
		  password : 'passw0rd',
		  database : 'inventorydatabase'
		});
		
		console.log("DATAACCESS: created connection, but not connected yet");	
		
		connection.connect(function(err) {
		
			if(err) {
				console.log('DATAACCESS: Error while performing connect= ' + err);
				return;
			}
/***			
	productlist = [
	      ["dummy1"],
	      ["BASIC"],
	      ["C"],
	      ["Data Access"]
	     ];
 ***/
	
			connection.query('INSERT into inventorytable (productname) VALUES ?', [productlist], function(err) {
	
		
			if (err) {
				console.log('DATAACCESS: Error while performing insert= ' + err);
//				return;
			}
						
	
			connection.end();
				
			console.log("DATAACCESS: insert completed");	
	
			res.send("Product data loaded count=" + rowcount + " product array=" + productlist);		
				
		}); /* END of insert */
			
		});	/* END of connect */
		
	}) /* END of fetch */
	.catch(err => console.error(err));
	

}); /* END of loadproductjson */


module.exports = app;