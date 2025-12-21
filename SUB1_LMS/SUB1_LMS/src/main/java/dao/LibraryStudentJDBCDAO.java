package dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import beans.Book;
import beans.BookIssued;
import factory.DBConn;

public class LibraryStudentJDBCDAO implements LibraryStudentDAO {

	Connection con;
	Statement stmt;
	PreparedStatement pstmt1, pstmt2, pstmt3, pstmt4;
	ResultSet rs;

	static LibraryStudentDAO dao;
	LibraryDAO dao0;

	private LibraryStudentJDBCDAO() {
		try {
			dao0=LibraryJDBCDAO.getInstance();
			con = DBConn.getConn();
			System.out.println("Connection established " + con);

			stmt = con.createStatement();
			pstmt4=con.prepareStatement("INSERT INTO bookIssued (issueId, isbn, bookName, regId, name, reserveDate, status) VALUES (?,?,?,?,?,?,?)");
			System.out.println("PreparedStatements are created");
		} catch (Exception e) {
			System.out.println(e);
		}
	}

	public static LibraryStudentDAO getInstance() {
		if (dao == null)
			dao = new LibraryStudentJDBCDAO();
		return dao;
	}
	
	@Override
	public List<Book> findAllBooks(int regId) {
		List<Book> books=new ArrayList<Book>();
		Set<String> allBookIds=new HashSet<String>();
		Set<String> matchingBookIds=new HashSet<String>();
		String booksIn=null;
		
		try {
			rs=stmt.executeQuery("select isbn from book");
			while(rs.next()) {
				allBookIds.add(rs.getString(1));
			}
			rs.close();
			
			rs=stmt.executeQuery("select isbn from bookIssued where regId="+regId+" and status in ('RESERVED','ISSUED','RENEWALED')");
			while(rs.next()) {
				matchingBookIds.add(rs.getString(1));
			}
			rs.close();
			
			allBookIds.removeAll(matchingBookIds);
			
			booksIn=String.join(",", allBookIds);
			
			rs = stmt.executeQuery("select * from book b where b.isbn IN ("+booksIn+")");
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
	public boolean reserveBook(String isbn, int regId) {
		boolean flag=false;
		int issueId=0;
		int i=0;
		try {
				rs=stmt.executeQuery("select max(issueId) from bookIssued");
				if(rs.next()) {
					issueId=rs.getInt(1);
				}

			String bookName=dao0.findBookNameByIsbn(isbn);
			String name=dao0.findNameByRegId(regId);
		
			issueId++;
			pstmt4.setInt(1, issueId);
			pstmt4.setString(2, isbn);
			pstmt4.setString(3, bookName);
			pstmt4.setInt(4, regId);
			pstmt4.setString(5, name);
			pstmt4.setDate(6, new java.sql.Date(System.currentTimeMillis()));
			pstmt4.setString(7, "RESERVED");
			i=pstmt4.executeUpdate();
			flag=true;
			System.out.println("Book reserved");
		} catch(Exception e) {
			e.printStackTrace();
		}
		return flag;
	}
	
	@Override
	public List<BookIssued> findReservedBooks(int regId) {
		List<BookIssued> list=new ArrayList<BookIssued>();
		try {
			rs=stmt.executeQuery("select * from bookissued where status='RESERVED' and regId="+regId);
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
	public List<BookIssued> findIssuedBooks(int regId) {
		List<BookIssued> list=new ArrayList<BookIssued>();
		try {
			rs=stmt.executeQuery("select * from bookissued where status='ISSUED' and regId="+regId);
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

	public List<BookIssued> findRenewaledBooks(int regId) {
		List<BookIssued> list=new ArrayList<BookIssued>();
		try {
			rs=stmt.executeQuery("select * from bookissued where status='RENEWALED' and regId="+regId);
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

	public List<BookIssued> findReturnedBooks(int regId) {
		List<BookIssued> list=new ArrayList<BookIssued>();
		try {
			rs=stmt.executeQuery("select * from bookissued where status='RETURNED' and regId="+regId);
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
