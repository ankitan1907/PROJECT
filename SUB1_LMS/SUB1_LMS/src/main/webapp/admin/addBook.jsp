<!DOCTYPE html>
<html>
<head>
    <meta charset="ISO-8859-1">
    <title>Add Book</title>

    <!-- Bootstrap 4 CSS -->
    <link rel="stylesheet" href="../bootstrap-4.0.0/bootstrap-4.0.0/dist/css/bootstrap.css">
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
    
    <div class="row justify-content-center">
        <div class="col-md-6">

            <div class="card shadow">
                <div class="card-header bg-primary text-white">
                    <h4 class="mb-0">Add Book</h4>
                </div>

                <div class="card-body">
                    <form method="POST" action="../AddBookServlet">

                        <div class="form-group">
                            <label>ISBN</label>
                            <input type="text" name="isbn" class="form-control">
                        </div>

                        <div class="form-group">
                            <label>Book Name</label>
                            <input type="text" name="bookName" class="form-control">
                        </div>

                        <div class="form-group">
                            <label>Author</label>
                            <input type="text" name="author" class="form-control">
                        </div>

                        <div class="form-group">
                            <label>Price</label>
                            <input type="text" name="price" class="form-control">
                        </div>

                        <div class="form-group">
                            <label>Publisher</label>
                            <input type="text" name="publisher" class="form-control">
                        </div>

                        <div class="form-group">
                            <label>Publishing Year</label>
                            <input type="text" name="publishingYear" class="form-control">
                        </div>

                        <div class="form-group">
                            <label>Qty Available</label>
                            <input type="text" name="qtyAvailable" class="form-control">
                        </div>

                        <div class="text-center mt-4">
                            <button type="submit" class="btn btn-success">Add Book</button>
                            <button type="reset" class="btn btn-secondary ml-2">Clear</button>
                        </div>

                    </form>
                </div>

            </div>

        </div>
    </div>
</div>

</body>
</html>
