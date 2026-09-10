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
                    /* "Mixed" was removed in 1.3.0. It was never implemented:
                       the drag/drop order it named (_tubebay_video_order) has no
                       reader, and the gallery treated any non-"first" value as
                       "last", so the option did nothing "Last" did not already do.
                       Re-add it only together with real interleaving. */
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
          },
          {
            id: "muted_autoplay",
            label: "Autoplay Shortcode Videos",
            render: () => (
              <>
                <ClassicCheckbox
                  id="muted_autoplay"
                  checked={settings.muted_autoplay ?? false}
                  onChange={(checked) => updateLocalSetting("muted_autoplay", checked)}
                  label="Autoplay videos embedded with the shortcode (muted)"
                />
                {/* This option was saveable and read by nothing: the shortcode
                    fell back to "Autoplay First Video" above, which is a
                    gallery setting, so changing that quietly altered every
                    [tubebay_video] on the site. They are separate now, and this
                    is the one the shortcode uses. */}
                <p className="description">Applies to <code>[tubebay_video]</code> embeds only, not the product gallery. A single shortcode can still override this with <code>autoplay="1"</code> or <code>autoplay="0"</code>.</p>
              </>
            )
          }
        ]}
      />
    </>
  );
};
