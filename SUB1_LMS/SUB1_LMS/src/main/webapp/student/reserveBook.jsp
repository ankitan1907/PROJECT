<%@page import="dao.LibraryStudentJDBCDAO"%>
<%@page import="dao.LibraryStudentDAO"%>
<%@page import="dao.LibraryJDBCDAO"%>
<%@page import="dao.LibraryDAO"%>
<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="ISO-8859-1">
<title>Reserve Book</title>
  <link href="../bootstrap-4.0.0/bootstrap-4.0.0/dist/css/bootstrap.css" rel="stylesheet" />
</head>
<body>
	<%
		String isbn=request.getParameter("isbn");
		int regId=Integer.parseInt(request.getParameter("regId"));
        LibraryStudentDAO dao = LibraryStudentJDBCDAO.getInstance();
		boolean flag=dao.reserveBook(isbn, regId);
		if(flag) {
	%>
			<jsp:forward page="findAllBooks.jsp"></jsp:forward>
		<% 
		} else {
			out.println("Error ");
		}	
		%>	
</body>
</html>