package entities.types;

public class TimelineMemory {
  private String date;
  private String title;
  private String description;
  private String memoryId;

  public String getDate() {
    return date;
  }

  public void setDate(String date) {
    this.date = date;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getMemoryId() {
    return memoryId;
  }

  public void setMemoryId(String memoryId) {
    this.memoryId = memoryId;
  }
}
