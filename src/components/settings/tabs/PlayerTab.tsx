import { FC } from "react";
import { ClassicSettingsTable, ClassicSelect, ClassicCheckbox } from "../../classics";
import { PluginSettings } from "../../../utils/types";

interface PlayerTabProps {
  settings: PluginSettings;
  updateLocalSetting: (key: keyof PluginSettings, value: any) => void;
}

export const PlayerTab: FC<PlayerTabProps> = ({ settings, updateLocalSetting }) => {
  return (
    <>
      <ClassicSettingsTable
        title="Video Player Settings"
        description="Configure how YouTube videos are displayed on your product pages."
        fields={[
          {
            id: "player_mode",
            label: "Default Player Mode",
            render: () => (
              <>
                <ClassicSelect
                  id="player_mode"
                  value={settings.player_mode || "inline"}
                  onChange={(val) => updateLocalSetting("player_mode", val)}
                  options={[
                    { label: "Inline (Plays inside gallery)", value: "inline" },
                    { label: "Lightbox (Opens in popup)", value: "lightbox" },
                  ]}
                />
                <p className="description">Choose how videos are played when clicked in the gallery.</p>
              </>
            ),
          },
          {
            id: "max_videos",
            label: "Max Videos Per Product",
            render: () => (
              <>
                <input
                  type="number"
                  id="max_videos"
                  value={settings.max_videos ?? 0}
                  onChange={(e) => updateLocalSetting("max_videos", parseInt(e.target.value) || 0)}
                  min="0"
                  step="1"
                />
                <p className="description">Maximum number of videos to show in the gallery (0 = unlimited).</p>
              </>
            ),
          },
          {
            id: "video_position",
            label: "Video Position in Gallery",
            render: () => (
              <>
                <ClassicSelect
                  id="video_position"
                  value={settings.video_position || "first"}
                  onChange={(val) => updateLocalSetting("video_position", val)}
                  options={[
                    { label: "First (Before images)", value: "first" },
                    { label: "Last (After images)", value: "last" },
                    { label: "Mixed (Based on drag/drop order)", value: "mixed" },
                  ]}
                />
                <p className="description">Where videos should appear relative to product images.</p>
              </>
            ),
          },
          {
            id: "autoplay_first",
            label: "Autoplay First Video",
            render: () => (
              <>
                <ClassicCheckbox
                  id="autoplay_first"
                  checked={settings.autoplay_first ?? false}
                  onChange={(checked) => updateLocalSetting("autoplay_first", checked)}
                  label="Autoplay the first video (muted)"
                />
                <p className="description">If enabled, the first video in the gallery will start playing automatically without sound. Subsequent videos will not autoplay.</p>
              </>
            )
          },
          {
            id: "show_duration",
            label: "Show Duration Badge",
            render: () => (
              <>
                <ClassicCheckbox
                  id="show_duration"
                  checked={settings.show_duration ?? true}
                  onChange={(checked) => updateLocalSetting("show_duration", checked)}
                  label="Show video duration on thumbnails"
                />
                <p className="description">Display the length of the video in the bottom-right corner of the thumbnail.</p>
              </>
            )
          },
          {
            id: "privacy_mode",
            label: "Privacy/GDPR Mode",
            render: () => (
              <>
                <ClassicCheckbox
                  id="privacy_mode"
                  checked={settings.privacy_mode ?? false}
                  onChange={(checked) => updateLocalSetting("privacy_mode", checked)}
                  label="Enable YouTube Privacy-Enhanced Mode"
                />
                <p className="description">Use youtube-nocookie.com to embed YouTube videos, which won't store information about visitors unless they play the video.</p>
              </>
            )
          },
          {
            id: "show_controls",
            label: "Show Player Controls",
            render: () => (
              <>
                <ClassicCheckbox
                  id="show_controls"
                  checked={settings.show_controls ?? true}
                  onChange={(checked) => updateLocalSetting("show_controls", checked)}
                  label="Show YouTube player controls"
                />
                <p className="description">Display play, pause, volume, and fullscreen buttons on the video player.</p>
              </>
            )
          }
        ]}
      />
    </>
  );
};
