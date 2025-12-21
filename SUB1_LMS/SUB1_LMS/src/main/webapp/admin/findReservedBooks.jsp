<%@page import="beans.BookIssued"%>
<%@page import="beans.Book"%>
<%@page import="java.util.List"%>
<%@page import="dao.LibraryDAO"%>
<%@page import="dao.LibraryJDBCDAO"%>
<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="ISO-8859-1">
<title>Reserved Books</title>

<!-- Bootstrap -->
<link href="../bootstrap-4.0.0/bootstrap-4.0.0/dist/css/bootstrap.css" rel="stylesheet" />

</head>
<body class="bg-light">

<!-- NAVBAR -->
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <a class="navbar-brand" href="#">Library Admin</a>

  <div class="ml-auto text-white">
    Welcome <%=session.getAttribute("name")%>  
    <a href="../Logout.jsp" class="btn btn-sm btn-danger ml-2">Logout</a>
  </div>
</nav>

<div class="container mt-4">
	<div class="card shadow p-4">
		<h3 class="text-center mb-4">Admin Dashboard</h3>

		<!-- Horizontal Menu -->
		<ul class="nav nav-pills justify-content-center">

			<li class="nav-item"><a class="nav-link"
				href="addBook.jsp">➕ Add Book</a></li>

			<li class="nav-item"><a class="nav-link"
				href="findAllBooks.jsp">📘 All Books</a></li>

			<li class="nav-item"><a class="nav-link"
				href="findReservedBooks.jsp">📚 Reserved Books</a></li>

			<li class="nav-item"><a class="nav-link"
				href="findIssuedBooks.jsp">📤 Issued Books</a></li>

			<li class="nav-item"><a class="nav-link"
				href="findRenewaledBooks.jsp">🔄 Renewaled Books</a></li>

			<li class="nav-item"><a class="nav-link"
				href="findReturnedBooks.jsp">📥 Returned Books</a></li>

		</ul>
	</div>

<%
    try {
        LibraryDAO dao = LibraryJDBCDAO.getInstance();
        List<BookIssued> booksIssued = dao.findReservedBooks();
%>

    <div class="card shadow">
        <div class="card-header bg-primary text-white">
            <h4 class="mb-0">Reserved Books</h4>
        </div>

        <div class="card-body p-0">
            <table class="table table-striped table-hover mb-0">
                <thead class="thead-dark">
                    <tr>
                        <th>IssuedId</th>
                        <th>ISBN</th>
                        <th>Book Name</th>
                        <th>RegId</th>
                        <th>Name</th>
                        <th>Reserve Date</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                <%
                    for(BookIssued bookIssued : booksIssued) {
                %>
                    <tr>
                        <td><%=bookIssued.getIssueId()%></td>
                        <td><%=bookIssued.getIsbn()%></td>
                        <td><%=bookIssued.getBookName()%></td>
                        <td><%=bookIssued.getRegId()%></td>
                        <td><%=bookIssued.getName()%></td>
                        <td><%=bookIssued.getReserveDate()%></td>
                        <td><%=bookIssued.getStatus()%></td>
                        
                        <td>
                            <a href="./bookIssue.jsp?issueId=<%=bookIssued.getIssueId()%>" 
                               class="btn btn-sm btn-success">
                                Issue
                            </a>
                        </td>
                    </tr>
                <%
                    }
                %>
                </tbody>
            </table>
        </div>
    </div>

<%
    } catch(Exception e) {
        e.printStackTrace();
    }
%>

</div>

</body>
</html>
