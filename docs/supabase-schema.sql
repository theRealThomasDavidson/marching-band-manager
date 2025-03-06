-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Levels Table
drop table if exists levels cascade;
CREATE TABLE levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Anonymous',
  music_theme TEXT,
  song_title TEXT,
  tempo INTEGER,
  duration_seconds INTEGER,
  plays INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- Band Members Table
drop table if exists band_members cascade;
CREATE TABLE band_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level_id UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  instrument TEXT NOT NULL,
  instrument_type TEXT NOT NULL CHECK (instrument_type IN ('brass', 'woodwind', 'percussion', 'trumpet', 'trombone', 'saxophone', 'flute', 'clarinet', 'tuba', 'percussion', 'color_guard')),
  start_x FLOAT NOT NULL,
  start_y FLOAT NOT NULL,
  end_x FLOAT NOT NULL,
  end_y FLOAT NOT NULL,
  radius FLOAT NOT NULL DEFAULT 1,
  speed FLOAT NOT NULL DEFAULT 1,
  midi_track JSONB DEFAULT jsonb_build_object(
    'notes', '[]'::JSONB,
    'tempo', 120,
    'instrument', 0,
    'duration', 0
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MIDI Tracks Table
drop table if exists midi_tracks cascade;
CREATE TABLE midi_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  band_member_id UUID NOT NULL REFERENCES band_members(id) ON DELETE CASCADE,
  tempo INTEGER NOT NULL DEFAULT 120,
  instrument_number INTEGER NOT NULL,
  duration FLOAT NOT NULL,
  track_data JSONB, -- Store the track data as JSON
  track_number INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Update modified column function
drop function if exists update_modified_column;
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamps
drop trigger if exists set_levels_updated_at on levels;
CREATE TRIGGER set_levels_updated_at
BEFORE UPDATE ON levels
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

drop trigger if exists set_band_members_updated_at on band_members;
CREATE TRIGGER set_band_members_updated_at
BEFORE UPDATE ON band_members
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

drop trigger if exists set_midi_tracks_updated_at on midi_tracks; 
CREATE TRIGGER set_midi_tracks_updated_at
BEFORE UPDATE ON midi_tracks
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Stored procedure to create a complete level with band members and MIDI tracks in a single transaction
drop function if exists create_complete_level;
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
