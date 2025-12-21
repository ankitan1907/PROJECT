package servlets;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import dao.LibraryDAO;
import dao.LibraryJDBCDAO;


@WebServlet("/LoginServlet")
public class LoginServlet extends HttpServlet {
	
	public void doPost(HttpServletRequest request, 
			HttpServletResponse response) 
					throws ServletException, IOException {
		response.setContentType("text/html");
		PrintWriter out=response.getWriter();
		HttpSession session=request.getSession();
		ServletContext context=getServletContext();
		
		try {
		// read the form content
		String email=request.getParameter("email").trim();
		String pass=request.getParameter("pass").trim();
		String roleName=request.getParameter("roleName").trim();
		
		// create DAO object
		LibraryDAO dao=LibraryJDBCDAO.getInstance();
		
		// invoke dao.login(email,pass,roleName)
		int regId=dao.login(email, pass, roleName);
		
		// if successful, forward adminIndex or studentIndex 
		// page to browser
		if(regId > 0) {
			String name=dao.findNameByRegId(regId);
			session.setAttribute("name", name);
			session.setAttribute("regId", regId);
			session.setAttribute("roleName", roleName);
			
			if(roleName.equalsIgnoreCase("admin")) {
				/*RequestDispatcher disp=
						context.getRequestDispatcher(
								"/admin/adminIndex.jsp"); 
					disp.forward(request, response);
				*/
				response.sendRedirect("./admin/adminIndex.jsp");
				
			} else 	if(roleName.equalsIgnoreCase("student")) {
				/* RequestDispatcher disp=
						context.getRequestDispatcher(
								"/student/studentIndex.jsp");
				disp.forward(request, response);
				*/
				response.sendRedirect("./student/studentIndex.jsp");
			}
		} else {
			request.setAttribute("loginError", 
					"Login Failed. Email/Pass is wrong");
			context.getRequestDispatcher("/index.jsp")
				.forward(request,  response);
		}			
		// otherwise redirect index.jsp to browser, to display 
		// error message and to take login credentials again.
		} catch(Exception e) {
			e.printStackTrace();
		}	
	}
}
