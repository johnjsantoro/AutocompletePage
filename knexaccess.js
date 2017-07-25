
console.log("KNEXACCESS: entering");

var express = require('express');
var app = express();

const mysql = require('mysql');
const Knex = require('knex');

const config = {
  user: "root",
  password: "passw0rd",
  database: "inventorydatabase",
  host: "35.188.113.158"
};


function getProductnames (knex) {
  return knex.select('productname')
    .from('inventorytable')
    .orderBy('productname')
    .then((results) => {
    	
    	var dataTags = [];
					
console.log('DATAACCESS:  The solution is: ', results);
		
		for (var i = 0; i < results.length; i++) {
			var row = results[i];
	
			dataTags[i] = row.productname;
		}
    	
    	
      return dataTags;
    });
}


/*
 * Get the real product data from MySQL
 */
app.get('/realdata', function(req, res, next) {
	
	
console.log("DATAACCESS: entering route");
	

	
	var dataTags = [];
	
	/*
	 * Connect to MySQL
	 */
//	const connectionName = "autocomplete-demo-174321:us-central1:autocomplete-db-instance";


  	 // Connect to the database
  	var knex = Knex({
    	client: "mysql",
    	connection: config
  	});







	
console.log("DATAACCESS: created connection, but not connected yet");	

	getProductnames(knex)
		.then((productlist) => {
  			
console.log("DATAACCESS: route returning length=" + productlist.length + " values=" + productlist);	
  			
  			res.send(productlist);			
		})



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
	var productjsonurl = "https://storage.googleapis.com/autocomplete-demo-174321.appspot.com/bbproduct.json";

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
	
			productlist[i] = product.name;
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
			
	productlist = [
	      ["dummy1"],
	      ["BASIC"],
	      ["C"],
	      ["Data Access"]
	     ];
	
			connection.query('INSERT into inventorytable (productname) VALUES ?', [productlist], function(err) {
	
		
			if (err) {
				console.log('DATAACCESS: Error while performing insert= ' + err);
//				return;
			}
						
	
			connection.release();
				
			console.log("DATAACCESS: insert completed");	
	
			res.send("Product data loaded count=" + rowcount + " product array=" + productlist);		
				
		}); /* END of insert */
			
		});	/* END of connect */
		
	}) /* END of fetch */
	.catch(err => console.error(err));
	

}); /* END of loadproductjson */


module.exports = app;