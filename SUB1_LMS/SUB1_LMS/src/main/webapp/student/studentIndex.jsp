<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="ISO-8859-1">
<title>Student Index</title>

<!-- Bootstrap CSS -->
<link href="../bootstrap-4.0.0/bootstrap-4.0.0/dist/css/bootstrap.css" rel="stylesheet" />

</head>
<body class="bg-light">

<!-- Top Bar -->
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <a class="navbar-brand" href="#">Library Portal</a>

  <div class="ml-auto text-white">
      Welcome <%= session.getAttribute("name") %> 
      <a href="./Logout.jsp" class="btn btn-sm btn-outline-light ml-2">Logout</a>
  </div>
</nav>

<!-- Page Content -->
<div class="container mt-4">
    <div class="card shadow-sm">
        <div class="card-body">
            <h4 class="mb-3">Student Dashboard</h4>

            <!-- Horizontal Menu -->
            <ul class="nav nav-pills justify-content-center">

                <li class="nav-item">
                    <a class="nav-link" href="./findAllBooks.jsp">📚 All Books</a>
                </li>

                <li class="nav-item">
                    <a class="nav-link" href="./findReservedBooks.jsp">🔒 Reserved Books</a>
                </li>

                <li class="nav-item">
                    <a class="nav-link" href="./findIssuedBooks.jsp">📖 Issued Books</a>
                </li>

                <li class="nav-item">
                    <a class="nav-link" href="./findRenewaledBooks.jsp">🔄 Renewaled Books</a>
                </li>

                <li class="nav-item">
                    <a class="nav-link" href="./findReturnedBooks.jsp">✔ Returned Books</a>
                </li>
            </ul>
        </div>
    </div>
</div>


</body>
</html>
