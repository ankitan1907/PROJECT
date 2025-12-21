package servlets;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import beans.Register;
import dao.LibraryDAO;
import dao.LibraryJDBCDAO;

@WebServlet("/RegisterServlet")
public class RegisterServlet extends HttpServlet {
	public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setContentType("text/html");
		PrintWriter out=response.getWriter();
		HttpSession session=request.getSession();
		ServletContext context=getServletContext();
		
		String name=request.getParameter("name").trim();
		String email=request.getParameter("email").trim();
		String pass=request.getParameter("pass").trim();
		long mobile=Long.parseLong(request.getParameter("mobile").trim());
		String address=request.getParameter("address").trim();
		String roleName=request.getParameter("roleName").trim();
		
		try {
			LibraryDAO dao=LibraryJDBCDAO.getInstance();
			Register register=new Register(0,name,email,pass,mobile,address,roleName);
			int regId=dao.register(register);
			if(regId>0)
				response.sendRedirect("./index.jsp");
		} catch(Exception e) {
			e.printStackTrace();
		}
	}

}
