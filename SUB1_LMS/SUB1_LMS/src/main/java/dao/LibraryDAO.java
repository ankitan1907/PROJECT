// LibraryDAO.java

package dao;

import java.util.List;

import beans.Book;
import beans.BookIssued;
import beans.Register;

public interface LibraryDAO {
	public int register(Register reg);
	public int login(String email, 
			String pass, String roleName);
	
	public boolean addBook(Book book);
	public boolean updateBook(Book book);
	public boolean deleteBook(String isbn);
	
	public List<Book> findAllBooks();
	public Book searchBookByName(String bookName);
	
	public String findBookNameByIsbn(String isbn);
	public String findNameByRegId(int regId);
	
	public List<BookIssued> findReservedBooks();
	public boolean issueBook(int issueId);
	public List<BookIssued> findIssuedBooks();
	
	public boolean renewalBook(int issueId);
	public boolean returnBook(int issueId);

	public List<BookIssued> findRenewaledBooks();
	public List<BookIssued> findReturnBooks();
}