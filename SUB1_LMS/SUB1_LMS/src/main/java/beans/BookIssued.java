// BookIssued.java
package beans;

import java.sql.Date;
import java.util.Objects;

public class BookIssued {
	private int issueId;
	private String isbn;
	private String bookName;
	private int regId;
	private String name;
	private Date reserveDate;
	private Date issueDate;
	private Date renewalDate;
	private Date returnedDate;
	private String status;
	public BookIssued() {
		super();
		// TODO Auto-generated constructor stub
	}
	public BookIssued(int issueId, String isbn, String bookName, int regId, String name, Date reserveDate,
			Date issueDate, Date renewalDate, Date returnedDate, String status) {
		super();
		this.issueId = issueId;
		this.isbn = isbn;
		this.bookName = bookName;
		this.regId = regId;
		this.name = name;
		this.reserveDate = reserveDate;
		this.issueDate = issueDate;
		this.renewalDate = renewalDate;
		this.returnedDate = returnedDate;
		this.status = status;
	}
	public int getIssueId() {
		return issueId;
	}
	public void setIssueId(int issueId) {
		this.issueId = issueId;
	}
	public String getIsbn() {
		return isbn;
	}
	public void setIsbn(String isbn) {
		this.isbn = isbn;
	}
	public String getBookName() {
		return bookName;
	}
	public void setBookName(String bookName) {
		this.bookName = bookName;
	}
	public int getRegId() {
		return regId;
	}
	public void setRegId(int regId) {
		this.regId = regId;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public Date getReserveDate() {
		return reserveDate;
	}
	public void setReserveDate(Date reserveDate) {
		this.reserveDate = reserveDate;
	}
	public Date getIssueDate() {
		return issueDate;
	}
	public void setIssueDate(Date issueDate) {
		this.issueDate = issueDate;
	}
	public Date getRenewalDate() {
		return renewalDate;
	}
	public void setRenewalDate(Date renewalDate) {
		this.renewalDate = renewalDate;
	}
	public Date getReturnedDate() {
		return returnedDate;
	}
	public void setReturnedDate(Date returnedDate) {
		this.returnedDate = returnedDate;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	@Override
	public String toString() {
		return "BookIssued [issueId=" + issueId + ", isbn=" + isbn + ", bookName=" + bookName + ", regId=" + regId
				+ ", name=" + name + ", reserveDate=" + reserveDate + ", issueDate=" + issueDate + ", renewalDate="
				+ renewalDate + ", returnedDate=" + returnedDate + ", status=" + status + "]";
	}
	@Override
	public int hashCode() {
		return Objects.hash(bookName, isbn, issueDate, issueId, name, regId, renewalDate, reserveDate, returnedDate,
				status);
	}
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		BookIssued other = (BookIssued) obj;
		return Objects.equals(bookName, other.bookName) && Objects.equals(isbn, other.isbn)
				&& Objects.equals(issueDate, other.issueDate) && issueId == other.issueId
				&& Objects.equals(name, other.name) && regId == other.regId
				&& Objects.equals(renewalDate, other.renewalDate) && Objects.equals(reserveDate, other.reserveDate)
				&& Objects.equals(returnedDate, other.returnedDate) && Objects.equals(status, other.status);
	}
}
