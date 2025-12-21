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

import beans.Book;
import dao.LibraryDAO;
import dao.LibraryJDBCDAO;

@WebServlet("/AddBookServlet")
public class AddBookServlet extends HttpServlet {
	public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setContentType("text/html");
		PrintWriter out=response.getWriter();
		HttpSession session=request.getSession();
		ServletContext context=getServletContext();

		String isbn=request.getParameter("isbn").trim();
		String bookName=request.getParameter("bookName").trim();
		String author=request.getParameter("author").trim();
		double price=Double.parseDouble(request.getParameter("price").trim());
		String publisher=request.getParameter("publisher").trim();
		int publishingYear=Integer.parseInt(request.getParameter("publishingYear").trim());
		int qtyAvailable=Integer.parseInt(request.getParameter("qtyAvailable").trim());
		
		Book book=new Book(isbn, bookName, author, price, publisher, publishingYear, qtyAvailable);
		
		try {
			LibraryDAO	dao=LibraryJDBCDAO.getInstance();
			boolean flag=dao.addBook(book);
			if(flag) {
				// context.getRequestDispatcher("/admin/adminIndex.jsp").forward(request, response);
				response.sendRedirect("./admin/adminIndex.jsp");
			} else
				out.println("Error");
		} catch(Exception e) {
			e.printStackTrace();
		}
	}

}
