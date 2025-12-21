<%@page import="dao.LibraryJDBCDAO"%>
<%@page import="dao.LibraryDAO"%>
<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="ISO-8859-1">
<title>Book Issue</title>
  <link href="../bootstrap-4.0.0/bootstrap-4.0.0/dist/css/bootstrap.css" rel="stylesheet" />
</head>
<body>
<%
	int issueId=Integer.parseInt(request.getParameter("issueId"));
	LibraryDAO dao=LibraryJDBCDAO.getInstance();
	boolean bool=dao.issueBook(issueId);
	if(bool)
		%>
			<jsp:forward page="adminIndex.jsp"></jsp:forward>
		<%
%>
</body>
</html>
