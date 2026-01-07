package entities;

import entities.enums.MemorialFrame;
import entities.enums.MemorialLivePortraitEffect;
import entities.enums.MemorialMusic;
import entities.enums.MemorialStatus;
import entities.enums.MemorialTribute;
import entities.enums.RelationToDeceased;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Formula;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "memorial")
public class MemorialEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  @Column(name = "id", columnDefinition = "uuid")
  private UUID id;

  @Column(name = "owner_id", columnDefinition = "uuid")
  private UUID ownerId;

  @OneToOne
  @JoinColumn(name = "owner_id")
  private UserEntity owner;

  @OneToMany(mappedBy = "memorial")
  private List<MemorialLikeEntity> likes;

  @CreationTimestamp
  @Column(name = "created_at", columnDefinition = "timestamptz")
  private OffsetDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at", columnDefinition = "timestamptz")
  private OffsetDateTime updatedAt;

  @Column(name = "name")
  private String name;

  @Column(name = "date_of_birth")
  private LocalDate dateOfBirth;

  @Column(name = "date_of_death")
  private LocalDate dateOfDeath;

  @Column(name = "place_of_birth")
  private LocalDate placeOfBirth;

  @Column(name = "place_of_death")
  private LocalDate placeOfDeath;

  @Column(name = "owner_relation")
  private RelationToDeceased ownerRelation;

  @Column(name = "origin_country")
  private String originCountry;

  @Column(name = "image_path")
  private String imagePath;

  @Column(name = "live_portrait_path")
  private String livePortraitPath;

  @Column(name = "cover_image_path")
  private String coverImagePath;

  @Column(name = "about")
  private String about;

  @Column(name = "status")
  private MemorialStatus status = MemorialStatus.DRAFT;

  @Column(name = "unlisted")
  private boolean unlisted;

  @Column(name = "default_slug", unique = true)
  private String defaultSlug;

  @Column(name = "premium_slug", unique = true)
  private String premiumSlug;

  @Column(name = "is_premium")
  private boolean isPremium;

  @Column(name = "frame_v2")
  private MemorialFrame frame = MemorialFrame.DEFAULT;

  @Column(name = "music")
  private MemorialMusic music;

  @Column(name = "tribute_v2")
  private MemorialTribute tribute = MemorialTribute.DEFAULT;

  @Column(name = "live_portrait_effect")
  private MemorialLivePortraitEffect livePortraitEffect;

  @Column(name = "simmtag_design")
  private Long simmTagDesign;

  @OneToMany(mappedBy = "memorial")
  private List<MemoryEntity> memories;

  @OneToMany(mappedBy = "memorial")
  private List<CondolenceEntity> condolences;

  @OneToMany(mappedBy = "memorial")
  private List<DonationEntity> donations;

  @OneToMany(mappedBy = "memorial")
  private List<MemorialTransactionEntity> transactions;

  @OneToOne(mappedBy = "memorial")
  private MemorialTimelineEntity timeline;

  @OneToOne(mappedBy = "memorial")
  private MemorialLocationEntity location;

  @Formula("(SELECT COUNT(*) FROM memorial_like ml WHERE ml.memorial_id = id)")
  private Integer totalLikes;

  @Formula(
      "(SELECT COUNT(*) FROM memory m WHERE m.memorial_id = id AND m.status = 'published')")
  private Integer totalMemories;

  @Formula(
      "(SELECT COUNT(*) FROM condolence c WHERE c.memorial_id = id AND c.status = 'published')")
  private Integer totalCondolences;

  @Formula("(SELECT COUNT(*) FROM memorial_view_log c WHERE c.memorial_id = id)")
  private Integer totalViews;

  @Formula(
      "(\n"
          + "    (\n"
          + "      COALESCE((\n"
          + "        SELECT t.flowers\n"
          + "        FROM (VALUES\n"
          + "          ('default'::memorial_tribute_v2, 0, 0),\n"
          + "          ('amethyst-tranquility'::memorial_tribute_v2, 7, 4),\n"
          + "          ('blossom-of-grace'::memorial_tribute_v2, 8, 5),\n"
          + "          ('crimson-devotion'::memorial_tribute_v2, 7, 6),\n"
          + "          ('flames-of-remembrance'::memorial_tribute_v2, 8, 0),\n"
          + "          ('frostlight-harmony'::memorial_tribute_v2, 11, 4),\n"
          + "          ('golden-serenity'::memorial_tribute_v2, 10, 8),\n"
          + "          ('lunar-serenity'::memorial_tribute_v2, 7, 4),\n"
          + "          ('midnight-serenity'::memorial_tribute_v2, 7, 10),\n"
          + "          ('ocean-of-light'::memorial_tribute_v2, 13, 0),\n"
          + "          ('royal-sunrise'::memorial_tribute_v2, 0, 11),\n"
          + "          ('celestial-bloom'::memorial_tribute_v2, 9, 6),\n"
          + "          ('midnight-elegy'::memorial_tribute_v2, 0, 17)\n"
          + "        ) AS t(key, candles, flowers)\n"
          + "        WHERE t.key = tribute_v2\n"
          + "          AND is_premium = true\n"
          + "      ), 0)\n"
          + "      +\n"
          + "      COALESCE((\n"
          + "        SELECT COALESCE(SUM(\n"
          + "          COALESCE(dv.flowers, 0) + COALESCE(tv.flowers, 0)\n"
          + "        ), 0)\n"
          + "        FROM memory m\n"
          + "        LEFT JOIN (VALUES\n"
          + "          ('amethera-rose'::memorial_decoration_new, 0, 1),\n"
          + "          ('amethyst-ravel'::memorial_decoration_new, 0, 1),\n"
          + "          ('aurelia-bloom'::memorial_decoration_new, 0, 1),\n"
          + "          ('azure-peonia'::memorial_decoration_new, 0, 1),\n"
          + "          ('celestia-lily'::memorial_decoration_new, 0, 1),\n"
          + "          ('circle-of-serenity'::memorial_decoration_new, 6, 0),\n"
          + "          ('coralia-hibiscus'::memorial_decoration_new, 0, 1),\n"
          + "          ('frostaria-bloom'::memorial_decoration_new, 0, 1),\n"
          + "          ('golden-reverie'::memorial_decoration_new, 0, 2),\n"
          + "          ('ivory-whisper'::memorial_decoration_new, 0, 1),\n"
          + "          ('lunaria-lily'::memorial_decoration_new, 0, 1),\n"
          + "          ('nocturne-calla'::memorial_decoration_new, 0, 1),\n"
          + "          ('rosalia-peony'::memorial_decoration_new, 0, 1),\n"
          + "          ('seraphine-calla'::memorial_decoration_new, 0, 1),\n"
          + "          ('solaria-bloom'::memorial_decoration_new, 0, 1),\n"
          + "          ('solaris-hibiscus'::memorial_decoration_new, 0, 1),\n"
          + "          ('sonata-bloom'::memorial_decoration_new, 0, 1),\n"
          + "          ('trinity-of-light'::memorial_decoration_new, 3, 0),\n"
          + "          ('veloria-lisianthus'::memorial_decoration_new, 0, 3)\n"
          + "        ) AS dv(key, candles, flowers) ON dv.key = m.decoration_new\n"
          + "        LEFT JOIN (VALUES\n"
          + "          ('default'::memorial_tribute_v2, 0, 0),\n"
          + "          ('amethyst-tranquility'::memorial_tribute_v2, 7, 4),\n"
          + "          ('blossom-of-grace'::memorial_tribute_v2, 8, 5),\n"
          + "          ('crimson-devotion'::memorial_tribute_v2, 7, 6),\n"
          + "          ('flames-of-remembrance'::memorial_tribute_v2, 8, 0),\n"
          + "          ('frostlight-harmony'::memorial_tribute_v2, 11, 4),\n"
          + "          ('golden-serenity'::memorial_tribute_v2, 10, 8),\n"
          + "          ('lunar-serenity'::memorial_tribute_v2, 7, 4),\n"
          + "          ('midnight-serenity'::memorial_tribute_v2, 7, 10),\n"
          + "          ('ocean-of-light'::memorial_tribute_v2, 13, 0),\n"
          + "          ('royal-sunrise'::memorial_tribute_v2, 0, 11),\n"
          + "          ('celestial-bloom'::memorial_tribute_v2, 9, 6),\n"
          + "          ('midnight-elegy'::memorial_tribute_v2, 0, 17)\n"
          + "        ) AS tv(key, candles, flowers) ON tv.key = m.asset_decoration_v2\n"
          + "        WHERE m.memorial_id = id\n"
          + "          AND m.status = 'published'\n"
          + "      ), 0)\n"
          + "      +\n"
          + "      COALESCE((\n"
          + "        SELECT COALESCE(SUM(\n"
          + "          COALESCE(dv.flowers, 0)\n"
          + "        ), 0)\n"
          + "        FROM condolence c\n"
          + "        LEFT JOIN (VALUES\n"
          + "          ('amethera-rose'::memorial_decoration_new, 0, 1),\n"
          + "          ('amethyst-ravel'::memorial_decoration_new, 0, 1),\n"
          + "          ('aurelia-bloom'::memorial_decoration_new, 0, 1),\n"
          + "          ('azure-peonia'::memorial_decoration_new, 0, 1),\n"
          + "          ('celestia-lily'::memorial_decoration_new, 0, 1),\n"
          + "          ('circle-of-serenity'::memorial_decoration_new, 6, 0),\n"
          + "          ('coralia-hibiscus'::memorial_decoration_new, 0, 1),\n"
          + "          ('frostaria-bloom'::memorial_decoration_new, 0, 1),\n"
          + "          ('golden-reverie'::memorial_decoration_new, 0, 2),\n"
          + "          ('ivory-whisper'::memorial_decoration_new, 0, 1),\n"
          + "          ('lunaria-lily'::memorial_decoration_new, 0, 1),\n"
          + "          ('nocturne-calla'::memorial_decoration_new, 0, 1),\n"
          + "          ('rosalia-peony'::memorial_decoration_new, 0, 1),\n"
          + "          ('seraphine-calla'::memorial_decoration_new, 0, 1),\n"
          + "          ('solaria-bloom'::memorial_decoration_new, 0, 1),\n"
          + "          ('solaris-hibiscus'::memorial_decoration_new, 0, 1),\n"
          + "          ('sonata-bloom'::memorial_decoration_new, 0, 1),\n"
          + "          ('trinity-of-light'::memorial_decoration_new, 3, 0),\n"
          + "          ('veloria-lisianthus'::memorial_decoration_new, 0, 3)\n"
          + "        ) AS dv(key, candles, flowers) ON dv.key = c.decoration_new\n"
          + "        WHERE c.memorial_id = id\n"
          + "          AND c.status = 'published'\n"
          + "      ), 0)\n"
          + "    )\n"
          + "  )")
  private Integer totalFlowers;

  @Formula(
      "(\n"
          + "    (\n"
          + "      COALESCE((\n"
          + "        SELECT t.candles\n"
          + "        FROM (VALUES\n"
          + "          ('default'::memorial_tribute_v2, 0, 0),\n"
          + "          ('amethyst-tranquility'::memorial_tribute_v2, 7, 4),\n"
          + "          ('blossom-of-grace'::memorial_tribute_v2, 8, 5),\n"
          + "          ('crimson-devotion'::memorial_tribute_v2, 7, 6),\n"
          + "          ('flames-of-remembrance'::memorial_tribute_v2, 8, 0),\n"
          + "          ('frostlight-harmony'::memorial_tribute_v2, 11, 4),\n"
          + "          ('golden-serenity'::memorial_tribute_v2, 10, 8),\n"
          + "          ('lunar-serenity'::memorial_tribute_v2, 7, 4),\n"
          + "          ('midnight-serenity'::memorial_tribute_v2, 7, 10),\n"
          + "          ('ocean-of-light'::memorial_tribute_v2, 13, 0),\n"
          + "          ('royal-sunrise'::memorial_tribute_v2, 0, 11),\n"
          + "          ('celestial-bloom'::memorial_tribute_v2, 9, 6),\n"
          + "          ('midnight-elegy'::memorial_tribute_v2, 0, 17)\n"
          + "        ) AS t(key, candles, flowers)\n"
          + "        WHERE t.key = tribute_v2\n"
          + "          AND is_premium = true\n"
          + "      ), 0)\n"
          + "      +\n"
          + "      COALESCE((\n"
          + "        SELECT COALESCE(SUM(\n"
          + "          COALESCE(dv.candles, 0) + COALESCE(tv.candles, 0)\n"
          + "        ), 0)\n"
          + "        FROM memory m\n"
          + "        LEFT JOIN (VALUES\n"
          + "          ('amethera-rose'::memorial_decoration_new, 0, 1),\n"
          + "          ('amethyst-ravel'::memorial_decoration_new, 0, 1),\n"
          + "          ('aurelia-bloom'::memorial_decoration_new, 0, 1),\n"
          + "          ('azure-peonia'::memorial_decoration_new, 0, 1),\n"
          + "          ('celestia-lily'::memorial_decoration_new, 0, 1),\n"
          + "          ('circle-of-serenity'::memorial_decoration_new, 6, 0),\n"
          + "          ('coralia-hibiscus'::memorial_decoration_new, 0, 1),\n"
          + "          ('frostaria-bloom'::memorial_decoration_new, 0, 1),\n"
          + "          ('golden-reverie'::memorial_decoration_new, 0, 2),\n"
          + "          ('ivory-whisper'::memorial_decoration_new, 0, 1),\n"
          + "          ('lunaria-lily'::memorial_decoration_new, 0, 1),\n"
          + "          ('nocturne-calla'::memorial_decoration_new, 0, 1),\n"
          + "          ('rosalia-peony'::memorial_decoration_new, 0, 1),\n"
          + "          ('seraphine-calla'::memorial_decoration_new, 0, 1),\n"
          + "          ('solaria-bloom'::memorial_decoration_new, 0, 1),\n"
          + "          ('solaris-hibiscus'::memorial_decoration_new, 0, 1),\n"
          + "          ('sonata-bloom'::memorial_decoration_new, 0, 1),\n"
          + "          ('trinity-of-light'::memorial_decoration_new, 3, 0),\n"
          + "          ('veloria-lisianthus'::memorial_decoration_new, 0, 3)\n"
          + "        ) AS dv(key, candles, flowers) ON dv.key = m.decoration_new\n"
          + "        LEFT JOIN (VALUES\n"
          + "          ('default'::memorial_tribute_v2, 0, 0),\n"
          + "          ('amethyst-tranquility'::memorial_tribute_v2, 7, 4),\n"
          + "          ('blossom-of-grace'::memorial_tribute_v2, 8, 5),\n"
          + "          ('crimson-devotion'::memorial_tribute_v2, 7, 6),\n"
          + "          ('flames-of-remembrance'::memorial_tribute_v2, 8, 0),\n"
          + "          ('frostlight-harmony'::memorial_tribute_v2, 11, 4),\n"
          + "          ('golden-serenity'::memorial_tribute_v2, 10, 8),\n"
          + "          ('lunar-serenity'::memorial_tribute_v2, 7, 4),\n"
          + "          ('midnight-serenity'::memorial_tribute_v2, 7, 10),\n"
          + "          ('ocean-of-light'::memorial_tribute_v2, 13, 0),\n"
          + "          ('royal-sunrise'::memorial_tribute_v2, 0, 11),\n"
          + "          ('celestial-bloom'::memorial_tribute_v2, 9, 6),\n"
          + "          ('midnight-elegy'::memorial_tribute_v2, 0, 17)\n"
          + "        ) AS tv(key, candles, flowers) ON tv.key = m.asset_decoration_v2\n"
          + "        WHERE m.memorial_id = id\n"
          + "          AND m.status = 'published'\n"
          + "      ), 0)\n"
          + "      +\n"
          + "      COALESCE((\n"
          + "        SELECT COALESCE(SUM(\n"
          + "          COALESCE(dv.candles, 0)\n"
          + "        ), 0)\n"
          + "        FROM condolence c\n"
          + "        LEFT JOIN (VALUES\n"
          + "          ('amethera-rose'::memorial_decoration_new, 0, 1),\n"
          + "          ('amethyst-ravel'::memorial_decoration_new, 0, 1),\n"
          + "          ('aurelia-bloom'::memorial_decoration_new, 0, 1),\n"
          + "          ('azure-peonia'::memorial_decoration_new, 0, 1),\n"
          + "          ('celestia-lily'::memorial_decoration_new, 0, 1),\n"
          + "          ('circle-of-serenity'::memorial_decoration_new, 6, 0),\n"
          + "          ('coralia-hibiscus'::memorial_decoration_new, 0, 1),\n"
          + "          ('frostaria-bloom'::memorial_decoration_new, 0, 1),\n"
          + "          ('golden-reverie'::memorial_decoration_new, 0, 2),\n"
          + "          ('ivory-whisper'::memorial_decoration_new, 0, 1),\n"
          + "          ('lunaria-lily'::memorial_decoration_new, 0, 1),\n"
          + "          ('nocturne-calla'::memorial_decoration_new, 0, 1),\n"
          + "          ('rosalia-peony'::memorial_decoration_new, 0, 1),\n"
          + "          ('seraphine-calla'::memorial_decoration_new, 0, 1),\n"
          + "          ('solaria-bloom'::memorial_decoration_new, 0, 1),\n"
          + "          ('solaris-hibiscus'::memorial_decoration_new, 0, 1),\n"
          + "          ('sonata-bloom'::memorial_decoration_new, 0, 1),\n"
          + "          ('trinity-of-light'::memorial_decoration_new, 3, 0),\n"
          + "          ('veloria-lisianthus'::memorial_decoration_new, 0, 3)\n"
          + "        ) AS dv(key, candles, flowers) ON dv.key = c.decoration_new\n"
          + "        WHERE c.memorial_id = id\n"
          + "          AND c.status = 'published'\n"
          + "      ), 0)\n"
          + "    )\n"
          + "  )")
  private Integer totalCandles;

  @Formula(
      "(SELECT COALESCE(SUM(d.item_count), 0) FROM donation d WHERE d.memorial_id = id AND d.status = 'published')")
  private Long totalTrees;

  @Formula(
      "(SELECT COALESCE(SUM(d.value_in_cents), 0) FROM donation d WHERE d.memorial_id = id AND d.status = 'published')")
  private Long totalDonationsInCents;

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public UUID getOwnerId() {
    return ownerId;
  }

  public void setOwnerId(UUID ownerId) {
    this.ownerId = ownerId;
  }

  public UserEntity getOwner() {
    return owner;
  }

  public void setOwner(UserEntity owner) {
    this.owner = owner;
  }

  public List<MemorialLikeEntity> getLikes() {
    return likes;
  }

  public void setLikes(List<MemorialLikeEntity> likes) {
    this.likes = likes;
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

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public LocalDate getDateOfBirth() {
    return dateOfBirth;
  }

  public void setDateOfBirth(LocalDate dateOfBirth) {
    this.dateOfBirth = dateOfBirth;
  }

  public LocalDate getDateOfDeath() {
    return dateOfDeath;
  }

  public void setDateOfDeath(LocalDate dateOfDeath) {
    this.dateOfDeath = dateOfDeath;
  }

  public LocalDate getPlaceOfBirth() {
    return placeOfBirth;
  }

  public void setPlaceOfBirth(LocalDate placeOfBirth) {
    this.placeOfBirth = placeOfBirth;
  }

  public LocalDate getPlaceOfDeath() {
    return placeOfDeath;
  }

  public void setPlaceOfDeath(LocalDate placeOfDeath) {
    this.placeOfDeath = placeOfDeath;
  }

  public RelationToDeceased getOwnerRelation() {
    return ownerRelation;
  }

  public void setOwnerRelation(RelationToDeceased ownerRelation) {
    this.ownerRelation = ownerRelation;
  }

  public String getOriginCountry() {
    return originCountry;
  }

  public void setOriginCountry(String originCountry) {
    this.originCountry = originCountry;
  }

  public String getImagePath() {
    return imagePath;
  }

  public void setImagePath(String imagePath) {
    this.imagePath = imagePath;
  }

  public String getLivePortraitPath() {
    return livePortraitPath;
  }

  public void setLivePortraitPath(String livePortraitPath) {
    this.livePortraitPath = livePortraitPath;
  }

  public String getCoverImagePath() {
    return coverImagePath;
  }

  public void setCoverImagePath(String coverImagePath) {
    this.coverImagePath = coverImagePath;
  }

  public String getAbout() {
    return about;
  }

  public void setAbout(String about) {
    this.about = about;
  }

  public MemorialStatus getStatus() {
    return status;
  }

  public void setStatus(MemorialStatus status) {
    this.status = status;
  }

  public boolean isUnlisted() {
    return unlisted;
  }

  public void setUnlisted(boolean unlisted) {
    this.unlisted = unlisted;
  }

  public String getDefaultSlug() {
    return defaultSlug;
  }

  public void setDefaultSlug(String defaultSlug) {
    this.defaultSlug = defaultSlug;
  }

  public String getPremiumSlug() {
    return premiumSlug;
  }

  public void setPremiumSlug(String premiumSlug) {
    this.premiumSlug = premiumSlug;
  }

  public boolean isPremium() {
    return isPremium;
  }

  public void setPremium(boolean premium) {
    isPremium = premium;
  }

  public MemorialFrame getFrame() {
    return frame;
  }

  public void setFrame(MemorialFrame frame) {
    this.frame = frame;
  }

  public MemorialMusic getMusic() {
    return music;
  }

  public void setMusic(MemorialMusic music) {
    this.music = music;
  }

  public MemorialTribute getTribute() {
    return tribute;
  }

  public void setTribute(MemorialTribute tribute) {
    this.tribute = tribute;
  }

  public MemorialLivePortraitEffect getLivePortraitEffect() {
    return livePortraitEffect;
  }

  public void setLivePortraitEffect(MemorialLivePortraitEffect livePortraitEffect) {
    this.livePortraitEffect = livePortraitEffect;
  }

  public Long getSimmTagDesign() {
    return simmTagDesign;
  }

  public void setSimmTagDesign(Long simmTagDesign) {
    this.simmTagDesign = simmTagDesign;
  }

  public List<MemoryEntity> getMemories() {
    return memories;
  }

  public void setMemories(List<MemoryEntity> memories) {
    this.memories = memories;
  }

  public List<CondolenceEntity> getCondolences() {
    return condolences;
  }

  public void setCondolences(List<CondolenceEntity> condolences) {
    this.condolences = condolences;
  }

  public List<DonationEntity> getDonations() {
    return donations;
  }

  public void setDonations(List<DonationEntity> donations) {
    this.donations = donations;
  }

  public List<MemorialTransactionEntity> getTransactions() {
    return transactions;
  }

  public void setTransactions(List<MemorialTransactionEntity> transactions) {
    this.transactions = transactions;
  }

  public MemorialTimelineEntity getTimeline() {
    return timeline;
  }

  public void setTimeline(MemorialTimelineEntity timeline) {
    this.timeline = timeline;
  }

  public MemorialLocationEntity getLocation() {
    return location;
  }

  public void setLocation(MemorialLocationEntity location) {
    this.location = location;
  }

  public Integer getTotalLikes() {
    return totalLikes;
  }

  public Integer getTotalMemories() {
    return totalMemories;
  }

  public Integer getTotalCondolences() {
    return totalCondolences;
  }

  public Integer getTotalViews() {
    return totalViews;
  }

  public Integer getTotalFlowers() {
    return totalFlowers;
  }

  public Integer getTotalCandles() {
    return totalCandles;
  }

  public Long getTotalTrees() {
    return totalTrees;
  }

  public Long getTotalDonationsInCents() {
    return totalDonationsInCents;
  }
}
