// LibraryJDBCDAO.java
package dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import beans.Book;
import beans.BookIssued;
import beans.Register;
import factory.DBConn;

public class LibraryJDBCDAO implements LibraryDAO {

	Connection con;
	Statement stmt;
	PreparedStatement pstmt1, pstmt2, pstmt3, pstmt4;
	ResultSet rs;

	static LibraryDAO dao;

	private LibraryJDBCDAO() {
		try {
			con = DBConn.getConn();
			System.out.println("Connection established " + con);

			stmt = con.createStatement();
			pstmt1 = con.prepareStatement("INSERT INTO register VALUES (?,?,?,?,?,?,?)");
			pstmt2 = con.prepareStatement("INSERT INTO book VALUES (?,?,?,?,?,?,?)");
			pstmt3 = con.prepareStatement("UPDATE book SET bookName=?, author=?, price=?, publisher=?, publishingYear=?, qtyAvailable=? WHERE isbn=? ");
			pstmt4=con.prepareStatement("INSERT INTO bookIssued (issueId, isbn, bookName, regId, name, reserveDate, status) VALUES (?,?,?,?,?,?,?)");
			System.out.println("PreparedStatements are created");
		} catch (Exception e) {
			System.out.println(e);
		}
	}

	public static LibraryDAO getInstance() {
		if (dao == null)
			dao = new LibraryJDBCDAO();
		return dao;
	}

	@Override
	public int register(Register reg) {
		int regId = 0;
		try {
			// pk generation
			rs = stmt.executeQuery("SELECT max(regid) from " + "register");
			if (rs.next()) {
				regId = rs.getInt(1);
			}
			regId++;

			// record insertion
			pstmt1.setInt(1, regId);
			pstmt1.setString(2, reg.getName());
			pstmt1.setString(3, reg.getEmail());
			pstmt1.setString(4, reg.getPass());
			pstmt1.setLong(5, reg.getMobile());
			pstmt1.setString(6, reg.getAddress());
			pstmt1.setString(7, reg.getRoleName());
			pstmt1.executeUpdate();
			System.out.println("new registeration with " + regId);
		} catch (Exception e) {
			System.out.println(e);
		}
		// return statement
		return regId;
	}

	@Override
	public int login(String email, String pass, String roleName) {
		int regId = 0;
		try {
			rs = stmt.executeQuery("select regId from register " + "where email='" + email + "' " + "and pass='" + pass
					+ "' " + "and roleName='" + roleName + "'");
			if (rs.next()) {
				regId = rs.getInt(1);
				System.out.println("Login Success ");
			} else {
				System.out.println("Login Failed ");
			}
		} catch (Exception e) {
			System.out.println(e);
		}
		return regId;
	}

	@Override
	public boolean addBook(Book book) {
		boolean flag = false;
		try {
			pstmt2.setString(1, book.getIsbn());
			pstmt2.setString(2, book.getBookName());
			pstmt2.setString(3, book.getAuthor());
			pstmt2.setDouble(4, book.getPrice());
			pstmt2.setString(5, book.getPublisher());
			pstmt2.setInt(6, book.getPublishingYear());
			pstmt2.setInt(7, book.getQtyAvailable());
			int i = pstmt2.executeUpdate();
			System.out.println("Book added");
			flag = true;
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			System.out.println(e);
		}
		return flag;
	}

	@Override
	public boolean updateBook(Book book) {
		boolean flag = false;
		try {
			pstmt3.setString(1, book.getBookName());
			pstmt3.setString(2, book.getAuthor());
			pstmt3.setDouble(3, book.getPrice());
			pstmt3.setString(4, book.getPublisher());
			pstmt3.setInt(5, book.getPublishingYear());
			pstmt3.setInt(6, book.getQtyAvailable());
			pstmt3.setString(7, book.getIsbn());
			pstmt3.executeUpdate();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return flag;
	}

	@Override
	public boolean deleteBook(String isbn) {
		boolean flag = false;
		try {
			int i=stmt.executeUpdate("delete from book where isbn='"+isbn+"'");
			if(i==1)
				System.out.println(isbn+" book deleted");
			else
				System.out.println(isbn+" book deletion failed");
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return flag;
	}

	@Override
	public List<Book> findAllBooks() {
		List<Book> books = new ArrayList<Book>();
		try {
			rs = stmt.executeQuery("select * from book");
			while (rs.next()) {
				Book book = new Book(rs.getString(1), rs.getString(2), rs.getString(3), rs.getDouble(4), rs.getString(5),
						rs.getInt(6), rs.getInt(7));
				books.add(book);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return books;
	}


	@Override
	public Book searchBookByName(String bookName) {
		Book book=null;
		try {
			rs=stmt.executeQuery("select * from book where bookName like '%"+bookName+"%'");
			if(rs.next()) {
				book=new Book(
				rs.getString(1),
				rs.getString(2),
				rs.getString(3),
				rs.getDouble(4),
				rs.getString(5),
				rs.getInt(6),
				rs.getInt(7)
				);
			}
		} catch(Exception e) {
			e.printStackTrace();
		}
		return book;
	}

	public String findBookNameByIsbn(String isbn) {
		String bookName="";
		try {
			rs=stmt.executeQuery("select bookName from book where isbn='"+isbn+"'");
			if(rs.next()) {
				bookName=rs.getString(1);
			}
		} catch(Exception e) {
			e.printStackTrace();
		}
		return bookName;
	}
	
	public String findNameByRegId(int regId) {
		String name="";
		try {
			rs=stmt.executeQuery("select name from register where regId="+regId);
			if(rs.next()) {
				name=rs.getString(1);
			}
		} catch(Exception e) {
			e.printStackTrace();
		}
		return name;		
	}


	@Override
	public List<BookIssued> findReservedBooks() {
		List<BookIssued> books=new ArrayList<BookIssued>();
		try {
			rs=stmt.executeQuery("SELECT * FROM bookissued WHERE status='RESERVED'");
			while(rs.next()) {
				BookIssued bi=new BookIssued(
						rs.getInt(1), 
						rs.getString(2), rs.getString(3),
						rs.getInt(4), rs.getString(5),
						rs.getDate(6), rs.getDate(7),
						rs.getDate(8), rs.getDate(9),
						rs.getString(10)
						);
				books.add(bi);
			}
		} catch(Exception e) {
			e.printStackTrace();
		}
		return books;
	}

	@Override
	public boolean issueBook(int issueId) {
		boolean flag=false;
		int qtyAvailable=0;
		String name="";
		int i=0,j=0;
		String bookName="";
		String isbn="";
		try {
			rs=stmt.executeQuery("select isbn from bookissued where issueId="+issueId); 
			if(rs.next()) {
				isbn=rs.getString(1);
			}
			
			con.setAutoCommit(false);
			rs=stmt.executeQuery("select bookName, qtyAvailable from book where isbn='"+isbn+"'");
			if(rs.next()) {
				bookName=rs.getString(1);
				qtyAvailable=rs.getInt(2);
				if(qtyAvailable>0) {
					qtyAvailable--;
					i=stmt.executeUpdate("update book set qtyAvailable="+qtyAvailable+" where isbn='"+isbn+"'");
					j=stmt.executeUpdate("update bookissued set issueDate=curdate(), status='ISSUED' WHERE issueId="+issueId);
				}
			}
			
			if(i==1 && j==1) {
				con.commit();
				flag=true;
				System.out.println("Book "+bookName+" issued ");
			} else {
				con.rollback();
				flag=false;
				System.out.println("Book "+bookName+" issued failed ");
			}
		} catch(Exception e) {
			flag=false;
		}
		return flag;		
	}

	@Override
	public List<BookIssued> findIssuedBooks() {
		List<BookIssued> list=new ArrayList<BookIssued>();
		try {
			rs=stmt.executeQuery("select * from bookissued where status='ISSUED'");
			while(rs.next()) {
				BookIssued bi=new BookIssued(
					rs.getInt(1),
					rs.getString(2),
					rs.getString(3),
					rs.getInt(4),
					rs.getString(5),
					rs.getDate(6),
					rs.getDate(7),
					rs.getDate(8),
					rs.getDate(9),
					rs.getString(10)
				);
				list.add(bi);
			}
		} catch(Exception e) {
			e.printStackTrace();
		}
		return list;
	}

	@Override
	public boolean renewalBook(int issueId) {
		boolean flag=false;
		try {
			
			int i=stmt.executeUpdate("update bookissued set renewalDate=curdate(), status='RENEWALED' WHERE issueId="+issueId);
			if(i==1) {
				System.out.println("Book renewaled "+issueId);
				flag=true;
			}	
			else {
				System.out.println("Book renewal failed "+issueId);
				flag=false;
			}
		} catch(Exception e) {
			e.printStackTrace();
		}
		return flag;
	}

	@Override
	public boolean returnBook(int issueId) {
		boolean flag=false;
		String isbn="";
		
		try {
			con.setAutoCommit(false);
			rs=stmt.executeQuery("select isbn from bookissued where issueId="+issueId);
			if(rs.next()) {
				isbn=rs.getString(1);
			}
			int i=stmt.executeUpdate("update bookissued set returnedDate=curdate(), status='RETURNED' where issueId="+issueId);
			int j=stmt.executeUpdate("update book set qtyAvailable=qtyAvailable+1 where isbn='"+isbn+"'");
			if(i==1 && j==1) {
				con.commit();
				System.out.println("Book returned "+issueId);
				flag=true;
			}	
			else {
				con.rollback();
				System.out.println("Book return failed "+issueId);
				flag=false;
			}
		} catch(Exception e) {
			e.printStackTrace();
		}
		return flag;
	}
	
	public List<BookIssued> findRenewaledBooks() {
		List<BookIssued> list=new ArrayList<BookIssued>();
		try {
			rs=stmt.executeQuery("select * from bookissued where status='RENEWALED'");
			while(rs.next()) {
				BookIssued bi=new BookIssued(
					rs.getInt(1),
					rs.getString(2),
					rs.getString(3),
					rs.getInt(4),
					rs.getString(5),
					rs.getDate(6),
					rs.getDate(7),
					rs.getDate(8),
					rs.getDate(9),
					rs.getString(10)
				);
				list.add(bi);
			}
		} catch(Exception e) {
			e.printStackTrace();
		}
		return list;		
	}
	public List<BookIssued> findReturnBooks() {
		List<BookIssued> list=new ArrayList<BookIssued>();
		try {
			rs=stmt.executeQuery("select * from bookissued where status='RETURNED'");
			while(rs.next()) {
				BookIssued bi=new BookIssued(
					rs.getInt(1),
					rs.getString(2),
					rs.getString(3),
					rs.getInt(4),
					rs.getString(5),
					rs.getDate(6),
					rs.getDate(7),
					rs.getDate(8),
					rs.getDate(9),
					rs.getString(10)
				);
				list.add(bi);
			}
		} catch(Exception e) {
			e.printStackTrace();
		}
		return list;		
	}
	
}
