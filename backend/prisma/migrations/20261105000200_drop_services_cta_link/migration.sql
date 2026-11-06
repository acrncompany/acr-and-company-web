-- Services bottom band button now opens the consultation modal, so its link block is unused.
DELETE FROM "ContentBlock" WHERE "pageKey" = 'services' AND "blockKey" = 'cta.button_url';
