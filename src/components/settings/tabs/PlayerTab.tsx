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
            label: "Max Videos Per Product (PRO)",
            render: () => (
              <>
                <input
                  type="number"
                  id="max_videos"
                  value={0}
                  disabled
                />
                <p className="description">Maximum number of videos to show in the gallery (0 = unlimited). <a href="https://wpanchorbay.com/products/tubebay-pro" target="_blank">Upgrade to Pro</a> to unlock.</p>
              </>
            ),
          },
          {
            id: "video_position",
            label: "Video Position in Gallery (PRO)",
            render: () => (
              <>
                <ClassicSelect
                  id="video_position"
                  value="first"
                  onChange={() => {}}
                  options={[
                    { label: "First (Before images)", value: "first" }
                  ]}
                  disabled
                />
                <p className="description">Where videos should appear relative to product images. <a href="https://wpanchorbay.com/products/tubebay-pro" target="_blank">Upgrade to Pro</a> to unlock more positions.</p>
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
            label: "Show Duration Badge (PRO)",
            render: () => (
              <>
                <ClassicCheckbox
                  id="show_duration"
                  checked={false}
                  onChange={() => {}}
                  label="Show video duration on thumbnails"
                  disabled
                />
                <p className="description">Display the length of the video in the bottom-right corner of the thumbnail. <a href="https://wpanchorbay.com/products/tubebay-pro" target="_blank">Upgrade to Pro</a> to unlock.</p>
              </>
            ),
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
