# in app/models/brand.py add:
use_rag = Column(Boolean, default=True)
use_lora = Column(Boolean, default=False)  # we won't use lora, keep toggle
tone_preset = Column(String, nullable=True)  # e.g., 'Gen Z', 'Corporate'
