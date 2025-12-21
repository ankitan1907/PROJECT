<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
	pageEncoding="ISO-8859-1"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="ISO-8859-1">
<title>Admin Index</title>

<!-- Bootstrap -->
<link href="../bootstrap-4.0.0/bootstrap-4.0.0/dist/css/bootstrap.css"
	rel="stylesheet" />

</head>
<body class="bg-light">

	<!-- NAVBAR -->
	<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
		<a class="navbar-brand" href="#">Library Admin</a>

		<div class="ml-auto text-white">
			Welcome
			<%=session.getAttribute("name")%>
			<a href="./Logout.jsp" class="btn btn-sm btn-danger ml-2">Logout</a>
		</div>
	</nav>

	<div class="container mt-5">

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

	</div>

</body>
</html>
