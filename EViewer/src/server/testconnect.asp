<%@ Page aspcompat=true %>
<%

'Sample Database Connection Syntax for ASP and SQL Server.

Dim oConn, oRs
Dim qry, connectstr
Dim db_name, db_username, db_userpassword
Dim db_server

db_server = "sv-evwr-01"
db_name = "EventCollections"
db_username = "EventReader"
db_userpassword = "C0nasata2"
dim fieldname = "your_field"
dim tablename = "GeneralEvents"

connectstr = "Driver={SQL Server};SERVER=" & db_server & ";DATABASE=" & db_name & ";UID=" & db_username & ";PWD=" & db_userpassword
oConn = Server.CreateObject("ADODB.Connection")
oConn.Open(connectstr)

qry = "SELECT * FROM " & tablename

oRS = oConn.Execute(qry)

Do until oRs.EOF
   Response.Write(ucase(fieldname) & ": " & oRs.Fields(fieldname))
   oRS.MoveNext
Loop
oRs.Close


oRs = nothing
oConn = nothing
%>