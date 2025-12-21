<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Login Form</title>
  <link href="./bootstrap-4.0.0/bootstrap-4.0.0/dist/css/bootstrap.css" rel="stylesheet" />
</head>
<body>
<!-- NAVBAR -->
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <a class="navbar-brand" href="#">Library Management System</a>
</nav>

<div class="container py-2">
	<p style="color:red;text-align: center;text-shadow: blue;"><b>${loginError}</b></p>	
  <h2 class="mb-4 text-center">Login</h2>
  <form method="post" action="./LoginServlet">
  <div class="row">
      <div class="col-md-2 mx-auto">
        <div class="form-group mb-3">
          <label for="email">Email address</label>
          <input type="email" class="form-control" id="email" name="email"
            aria-describedby="emailHelp" placeholder="Enter email"/>
        </div>
        <div class="form-group mb-3">
          <label for="pass">Password</label>
          <input type="password" class="form-control" id="pass" name="pass"
            aria-describedby="passHelp" placeholder="Enter password"/>
        </div>
        <div class="form-group mb-3">
          <label for="role">Role</label>
	      <select class="form-select" id="role" required  name="roleName">
	        <option value="" selected disabled>Select role</option>
	        <option value="admin">Admin</option>
	        <option value="student">Student</option>
	      </select>
        </div>
        <div class="form-group mb-3">
			<button type="submit" class="btn btn-primary">Login</button>
        </div>
      </div>
    </div>
  </form>
</div>
<center><a href="./Register.html">SignUp</a></center>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
