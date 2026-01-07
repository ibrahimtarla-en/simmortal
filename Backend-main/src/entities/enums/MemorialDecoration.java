package entities.enums;

public enum MemorialDecoration implements StringEnum {
  AMETHERA_ROSE("amethera-rose"),
  AMETHYST_RAVEL("amethyst-ravel"),
  AURELIA_BLOOM("aurelia-bloom"),
  AZURE_PEONIA("azure-peonia"),
  CELESTIA_LILY("celestia-lily"),
  CIRCLE_OF_SERENITY("circle-of-serenity"),
  CORALIA_HIBISCUS("coralia-hibiscus"),
  FROSTARIA_BLOOM("frostaria-bloom"),
  GOLDEN_REVERIE("golden-reverie"),
  IVORY_WHISPER("ivory-whisper"),
  LUNARIA_LILY("lunaria-lily"),
  NOCTURNE_CALLA("nocturne-calla"),
  ROSALIA_PEONY("rosalia-peony"),
  SERAPHINE_CALLA("seraphine-calla"),
  SOLARIA_BLOOM("solaria-bloom"),
  SOLARIS_HIBISCUS("solaris-hibiscus"),
  SONATA_BLOOM("sonata-bloom"),
  TRINITY_OF_LIGHT("trinity-of-light"),
  VELORIA_LISIANTHUS("veloria-lisianthus");

  private final String value;

  MemorialDecoration(String value) {
    this.value = value;
  }

  @Override
  public String getValue() {
    return value;
  }

  public static MemorialDecoration fromValue(String value) {
    if (value == null) {
      return null;
    }
    for (MemorialDecoration decoration : values()) {
      if (decoration.value.equals(value)) {
        return decoration;
      }
    }
    throw new IllegalArgumentException("Unknown MemorialDecoration: " + value);
  }
}
