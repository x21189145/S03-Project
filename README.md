"# S03-Project" 

-------Guide to assist with Windows file and folder auditing----------

https://www.manageengine.com/products/active-directory-audit/kb/how-to/how-to-enable-file-and-folder-access-auditing-in-windows-server.html

-------Actions on the file server----------

powershell /administrator
winrm quickconfig
if not running hit y to say yes to start running


computer managerment
open local users and groups
open groups
open eventlog readers
	add machine name of collector (SV-EVWR-01)

-------Actions on the SQL server----------

open event viewer
right click subscriptions
	click create subscriptoin
Enter name
	UserActivity
destination log
	select forwarded events
subscription type 
	select collector initiated
		click select computers
		add domain computers
		test and ok it
Under Events to collect
	click select events
	select event types
	in the event logs drop down select security

In advanced subscription settings
under event delivery optimzation
	Select normal - this is every 15 mins
	minimize bandwidth is every 6 hours
	minimize latency is every 30 seconds or so



install SQL
run create db SQL script in SQL
Run powershell as administrator
execute SQL server initial PS.ps1 to import initial events to db
.\SQL_server_initial_PS.ps1


In SQL Server Authentication. You will need to configure either Windows or SQL Server Authentication to be able to connect successfully to your server. 

-------SQL script to create database----------

DROP DATABASE IF exists EventCollections;
CREATE DATABASE EventCollections
;
USE EventCollections
;
-- the table name loosely relates to the name of my Win Event Subscription name
DROP TABLE IF exists GeneralEvents;
CREATE TABLE `GeneralEvents`( 
     `Id` int NULL,
     `LevelDisplayName` varchar(255) NULL,
     `LogName` varchar(255) NULL,
     `MachineName` varchar(255) NULL,
     `Message` varchar(255) NULL,
     `ProviderName` varchar(255) NULL,
     `RecordID` bigint NULL,
     `TaskDisplayName` varchar(255) NULL,
     `TimeCreated` datetime NULL
);
-- Create Unique Index with IGNORE_DUPE_KEY=ON to avoid duplicates in sqlbulk imports
CREATE UNIQUE INDEX `ClusteredIndex-EventCombo` ON `GeneralEvents` (
     `RecordID` ASC,
     `MachineName` ASC,
     `LogName` ASC
) 
;

-------Create additional tables in database----------

This could also be automated as part of script above.
Tables: DomainAdmins and Notifications


-------Execute PowerShell script to do initial import of logs to database----------

$events = Get-WinEvent ForwardedEvents |  Select-Object ID, LevelDisplayName, LogName, MachineName, Message, ProviderName, RecordID, TaskDisplayName, TimeCreated  

$connectionString = "Data Source=sqlserver;Integrated Security=true;Initial Catalog=EventCollections;"
$bulkCopy = new-object ("Data.SqlClient.SqlBulkCopy") $connectionString
$bulkCopy.DestinationTableName = "GeneralEvents"
$dt = New-Object "System.Data.DataTable"

# build the datatable
$cols = $events | select -first 1 | get-member -MemberType NoteProperty | select -Expand Name
foreach ($col in $cols)  {$null = $dt.Columns.Add($col)}
  
foreach ($event in $events)
  {
     $row = $dt.NewRow()
     foreach ($col in $cols) { $row.Item($col) = $event.$col }
     $dt.Rows.Add($row)
  }
  
 # Write to the database!
 $bulkCopy.WriteToServer($dt)

-------Schedule task import hourly logs to database----------

create scheduled task to import new events using HourlyUpdate.ps1 below

# While this script is intended to run on an hourly basis, the filter is set for going back 65 minutes.
# This allows the script to run for 5 minutes without any missing any events. Because we setup the 
# table using the IGNORE_DUPE_KEY = ON, duplicate entries are ignored in the database.

$xml = @'
<QueryList>
  <Query Id="0" Path="ForwardedEvents">
    <Select Path="ForwardedEvents">*[System[TimeCreated[timediff(@SystemTime) &lt;= 3900000]]]</Select>
  </Query>
</QueryList>
'@

$events = Get-WinEvent -FilterXml $xml |  Select-Object ID, LevelDisplayName, LogName, MachineName, Message, ProviderName, RecordID, TaskDisplayName, TimeCreated  

$connectionString = "Data Source=sqlserver;Integrated Security=true;Initial Catalog=EventCollections;"
$bulkCopy = new-object ("Data.SqlClient.SqlBulkCopy") $connectionString
$bulkCopy.DestinationTableName = "GeneralEvents"
$dt = New-Object "System.Data.DataTable"

# build the datatable
$cols = $events | select -first 1 | get-member -MemberType NoteProperty | select -Expand Name
foreach ($col in $cols)  {$null = $dt.Columns.Add($col)}
  
foreach ($event in $events)
  {
     $row = $dt.NewRow()
     foreach ($col in $cols) { $row.Item($col) = $event.$col }
     $dt.Rows.Add($row)
  }
 
# Write to the database!
$bulkCopy.WriteToServer($dt)

-------On Domain Controller----------

create users and security groups

-------On File server----------

create shares

-------On Domain Controller----------

create group policy to push single share to all users.
create groug policy for NTP (Network Time Protocal).
