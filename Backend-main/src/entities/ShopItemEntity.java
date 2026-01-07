package entities;

import entities.converters.PostgresStringArrayConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "shop_item")
public class ShopItemEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  @Column(name = "id", columnDefinition = "uuid")
  private UUID id;

  @CreationTimestamp
  @Column(name = "created_at", columnDefinition = "timestamptz")
  private OffsetDateTime createdAt;

  @Column(name = "name_en")
  private String nameEn;

  @Column(name = "name_tr")
  private String nameTr;

  @Column(name = "description_en")
  private String descriptionEn;

  @Column(name = "description_tr")
  private String descriptionTr;

  @Column(name = "price_in_cents")
  private Long priceInCents;

  @Convert(converter = PostgresStringArrayConverter.class)
  @Column(name = "image_path", columnDefinition = "text[]")
  private List<String> imagePath;

  @Column(name = "slug", unique = true)
  private String slug;

  @Convert(converter = PostgresStringArrayConverter.class)
  @Column(name = "category_en", columnDefinition = "text[]")
  private List<String> categoryEn;

  @Column(name = "is_active")
  private boolean isActive;

  @Convert(converter = PostgresStringArrayConverter.class)
  @Column(name = "category_tr", columnDefinition = "text[]")
  private List<String> categoryTr;

  @OneToOne(mappedBy = "item")
  private ShopFeaturedEntity featured;

  @OneToMany(mappedBy = "item")
  private List<ShopWaitlistEntity> waitlist;

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

  public String getNameEn() {
    return nameEn;
  }

  public void setNameEn(String nameEn) {
    this.nameEn = nameEn;
  }

  public String getNameTr() {
    return nameTr;
  }

  public void setNameTr(String nameTr) {
    this.nameTr = nameTr;
  }

  public String getDescriptionEn() {
    return descriptionEn;
  }

  public void setDescriptionEn(String descriptionEn) {
    this.descriptionEn = descriptionEn;
  }

  public String getDescriptionTr() {
    return descriptionTr;
  }

  public void setDescriptionTr(String descriptionTr) {
    this.descriptionTr = descriptionTr;
  }

  public Long getPriceInCents() {
    return priceInCents;
  }

  public void setPriceInCents(Long priceInCents) {
    this.priceInCents = priceInCents;
  }

  public List<String> getImagePath() {
    return imagePath;
  }

  public void setImagePath(List<String> imagePath) {
    this.imagePath = imagePath;
  }

  public String getSlug() {
    return slug;
  }

  public void setSlug(String slug) {
    this.slug = slug;
  }

  public List<String> getCategoryEn() {
    return categoryEn;
  }

  public void setCategoryEn(List<String> categoryEn) {
    this.categoryEn = categoryEn;
  }

  public boolean isActive() {
    return isActive;
  }

  public void setActive(boolean active) {
    isActive = active;
  }

  public List<String> getCategoryTr() {
    return categoryTr;
  }

  public void setCategoryTr(List<String> categoryTr) {
    this.categoryTr = categoryTr;
  }

  public ShopFeaturedEntity getFeatured() {
    return featured;
  }

  public void setFeatured(ShopFeaturedEntity featured) {
    this.featured = featured;
  }

  public List<ShopWaitlistEntity> getWaitlist() {
    return waitlist;
  }

  public void setWaitlist(List<ShopWaitlistEntity> waitlist) {
    this.waitlist = waitlist;
  }
}
