-- Stored procedure to create a complete level with band members and MIDI tracks in a single transaction
CREATE OR REPLACE FUNCTION create_complete_level(
  level_data JSONB,
  band_members_data JSONB
) RETURNS JSONB AS $$
DECLARE
  created_level_id UUID;
  band_member_data JSONB;
  created_band_member_id UUID;
  midi_track_data JSONB;
  result JSONB;
BEGIN
  -- Insert the level
  INSERT INTO levels (
    name,
    author,
    music_theme,
    song_title,
    tempo,
    duration_seconds
  ) VALUES (
    level_data->>'name',
    COALESCE(level_data->>'author', 'Anonymous'),
    level_data->>'music_theme',
    level_data->>'song_title',
    (level_data->>'tempo')::INTEGER,
    (level_data->>'duration_seconds')::INTEGER
  )
  RETURNING id INTO created_level_id;

  -- Process each band member
  FOR band_member_data IN SELECT * FROM jsonb_array_elements(band_members_data)
  LOOP
    -- Insert the band member
    INSERT INTO band_members (
      level_id,
      name,
      instrument,
      instrument_type,
      start_x,
      start_y,
      end_x,
      end_y,
      radius,
      speed
    ) VALUES (
      created_level_id,
      band_member_data->>'name',
      band_member_data->>'instrument',
      band_member_data->>'instrument_type',
      (band_member_data->>'start_x')::FLOAT,
      (band_member_data->>'start_y')::FLOAT,
      (band_member_data->>'end_x')::FLOAT,
      (band_member_data->>'end_y')::FLOAT,
      COALESCE((band_member_data->>'radius')::FLOAT, 1),
      COALESCE((band_member_data->>'speed')::FLOAT, 1)
    )
    RETURNING id INTO created_band_member_id;

    -- Process MIDI tracks for this band member
    IF band_member_data ? 'midiTracks' AND jsonb_array_length(band_member_data->'midiTracks') > 0 THEN
      FOR midi_track_data IN SELECT * FROM jsonb_array_elements(band_member_data->'midiTracks')
      LOOP
        -- Insert the MIDI track
        INSERT INTO midi_tracks (
          band_member_id,
          tempo,
          instrument_number,
          duration,
          track_data,
          track_number
        ) VALUES (
          created_band_member_id,
          COALESCE((midi_track_data->>'tempo')::INTEGER, (level_data->>'tempo')::INTEGER, 120),
          (midi_track_data->>'instrument_number')::INTEGER,
          (midi_track_data->>'duration')::FLOAT,
          midi_track_data->'track_data',
          (midi_track_data->>'track_number')::INTEGER
        );
      END LOOP;
    END IF;
  END LOOP;

  -- Return the created level id
  result := jsonb_build_object('id', created_level_id::TEXT);
  RETURN result;
END;
$$ LANGUAGE plpgsql;