package entities;

import entities.enums.ContactFormStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "contact_form")
public class ContactFormEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  @Column(name = "id", columnDefinition = "uuid")
  private UUID id;

  @CreationTimestamp
  @Column(name = "created_at", columnDefinition = "timestamptz")
  private OffsetDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at", columnDefinition = "timestamptz")
  private OffsetDateTime updatedAt;

  @Column(name = "user_id", columnDefinition = "uuid")
  private UUID userId;

  @ManyToOne
  @JoinColumn(name = "user_id", insertable = false, updatable = false)
  private UserEntity user;

  @Column(name = "first_name")
  private String firstName;

  @Column(name = "last_name")
  private String lastName;

  @Column(name = "email")
  private String email;

  @Column(name = "phone_number")
  private String phoneNumber;

  @Column(name = "message")
  private String message;

  @Column(name = "status")
  private ContactFormStatus status = ContactFormStatus.OPEN;

  @Column(name = "closed_by", columnDefinition = "uuid")
  private UUID closedBy;

  @ManyToOne
  @JoinColumn(name = "closed_by", insertable = false, updatable = false)
  private UserEntity closedByUser;

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(OffsetDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public OffsetDateTime getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(OffsetDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }

  public UUID getUserId() {
    return userId;
  }

  public void setUserId(UUID userId) {
    this.userId = userId;
  }

  public UserEntity getUser() {
    return user;
  }

  public void setUser(UserEntity user) {
    this.user = user;
  }

  public String getFirstName() {
    return firstName;
  }

  public void setFirstName(String firstName) {
    this.firstName = firstName;
  }

  public String getLastName() {
    return lastName;
  }

  public void setLastName(String lastName) {
    this.lastName = lastName;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPhoneNumber() {
    return phoneNumber;
  }

  public void setPhoneNumber(String phoneNumber) {
    this.phoneNumber = phoneNumber;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public ContactFormStatus getStatus() {
    return status;
  }

  public void setStatus(ContactFormStatus status) {
    this.status = status;
  }

  public UUID getClosedBy() {
    return closedBy;
  }

  public void setClosedBy(UUID closedBy) {
    this.closedBy = closedBy;
  }

  public UserEntity getClosedByUser() {
    return closedByUser;
  }

  public void setClosedByUser(UserEntity closedByUser) {
    this.closedByUser = closedByUser;
  }
}
