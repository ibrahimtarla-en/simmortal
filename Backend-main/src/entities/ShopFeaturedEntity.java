package entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "shop_featured")
public class ShopFeaturedEntity {
  @Id
  @Column(name = "item_id", columnDefinition = "uuid")
  private UUID itemId;

  @OneToOne
  @MapsId
  @JoinColumn(name = "item_id")
  private ShopItemEntity item;

  @Column(name = "image_path")
  private String imagePath;

  @Column(name = "title_en")
  private String titleEn;

  @Column(name = "title_tr")
  private String titleTr;

  @Column(name = "description_en")
  private String descriptionEn;

  @Column(name = "description_tr")
  private String descriptionTr;

  public UUID getItemId() {
    return itemId;
  }

  public void setItemId(UUID itemId) {
    this.itemId = itemId;
  }

  public ShopItemEntity getItem() {
    return item;
  }

  public void setItem(ShopItemEntity item) {
    this.item = item;
  }

  public String getImagePath() {
    return imagePath;
  }

  public void setImagePath(String imagePath) {
    this.imagePath = imagePath;
  }

  public String getTitleEn() {
    return titleEn;
  }

  public void setTitleEn(String titleEn) {
    this.titleEn = titleEn;
  }

  public String getTitleTr() {
    return titleTr;
  }

  public void setTitleTr(String titleTr) {
    this.titleTr = titleTr;
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
}
