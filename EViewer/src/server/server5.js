var config = {
    "server": "sv-evwr-01",
    "authentication": {
      "type": "default",
      "options": {
        "userName": "EventReader",
        "password": "C0nasata2"
      }
    },
    "options": {
      "port": 1433,
      "database": "EventCollections",
      "trustServerCertificate": true
    }
  }

  // file.js
  var UserRequest = '%dave%';
  const Request = require('tedious').Request;
  const Connection = require('tedious').Connection;
  const connection = new Connection(config);
  connection.on('connect', (err) => {
    if (err) {
      console.log('Connection Failed');
      throw err;
    }
    //console.log('success');
    executeStatement();
  });
  connection.connect();

  //var Request = require('tedious').Request;
  function executeStatement() {
    request = new Request("SELECT * FROM GeneralEvents WHERE Message LIKE '" + UserRequest + "'", function(err, rowCount) {
      //request = new Request("select * from GeneralEvents where TaskDisplayName = 'File System'", function(err, rowCount) {
      if (err) {
        console.log(err);
        
      } else {
        console.log(rowCount + ' rows');
        
        // document.write(5+6);
        // document.write(rowCount + 'rows');
        
      }
    });

      request.on('row', function(columns) {
      columns.forEach(function(column) {
      console.log(column.value);
     
      });
    });

    connection.execSql(request);
   
  }


//   function executeStatement() {
//     const request = new Request("select * FROM GeneralEvents", (err, rowCount) => {
//       if (err) {
//         throw err;
//       }
//       console.log('DONE!');
//       connection.close();
//     });
//     // Emits a 'DoneInProc' event when completed.
//     request.on('row', (columns) => {
//       columns.forEach((column) => {
//         if (column.value === null) {
//           console.log('NULL');
//         } else {
//           console.log(column.value);
//         }
//       });
//     });
//     // In SQL Server 2000 you may need: connection.execSqlBatch(request);
//     connection.execSql(request);
//   }