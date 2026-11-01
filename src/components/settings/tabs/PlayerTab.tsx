import { FC, ReactNode } from "react";
import { __ } from "@wordpress/i18n";
import { ClassicSettingsTable, ClassicSelect, ClassicCheckbox, ClassicToggle, ClassicTextarea } from "../../classics";
import { PluginSettings } from "../../../utils/types";
import { useWpabStore } from "../../../store/wpabStore";
import { TEXT_DOMAIN } from "../../../utils/textDomain";

/** Wraps a Pro-only control: dimmed + non-interactive in Free, plain in Pro. */
const ProLock: FC<{ locked: boolean; children: ReactNode }> = ({ locked, children }) =>
  locked ? (
    <div style={{ opacity: 0.5, pointerEvents: "none" }} aria-disabled="true">
      {children}
    </div>
  ) : (
    <>{children}</>
  );

const ProBadge: FC = () => (
  <span
    title={__("TubeBay Pro feature", TEXT_DOMAIN)}
    style={{
      display: "inline-block",
      background: "#6c5ce7",
      color: "#fff",
      fontSize: 10,
      fontWeight: 600,
      padding: "1px 5px",
      borderRadius: 3,
      marginLeft: 4,
    }}
  >
    PRO
  </span>
);

const ColorField: FC<{
  id: string;
  value: string;
  disabled?: boolean;
  onChange: (v: string) => void;
}> = ({ id, value, disabled, onChange }) => (
  <input
    type="color"
    id={id}
    value={value}
    disabled={disabled}
    onChange={(e) => onChange(e.target.value)}
  />
);

const clampInt = (raw: string, min: number, max: number) => {
  const n = parseInt(raw, 10);
  if (isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
};

interface PlayerTabProps {
  settings: PluginSettings;
  updateLocalSetting: (key: keyof PluginSettings, value: any) => void;
}

export const PlayerTab: FC<PlayerTabProps> = ({ settings, updateLocalSetting }) => {
  // `is_pro` is localized by the free plugin (false) and flipped to true by
  // TubeBay Pro through the `tubebay_admin_localize` filter.
  const { is_pro } = useWpabStore();
  const locked = !is_pro;

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

      <ClassicSettingsTable
        title={__("Appearance & Behavior", TEXT_DOMAIN)}
        description={__("Control how the video player looks and behaves inside the product gallery.", TEXT_DOMAIN)}
        fields={[
          {
            id: "play_icon",
            label: __("Play Icon", TEXT_DOMAIN),
            render: () => (
              <>
                <ClassicSelect
                  id="play_icon"
                  value={settings.play_icon || "youtube"}
                  onChange={(val) => updateLocalSetting("play_icon", val)}
                  options={[
                    { label: __("YouTube", TEXT_DOMAIN), value: "youtube" },
                    { label: __("Circle", TEXT_DOMAIN), value: "circle" },
                    { label: __("Triangle", TEXT_DOMAIN), value: "triangle" },
                  ]}
                />
                <p className="description">{__("The play button shown on video thumbnails.", TEXT_DOMAIN)}</p>
              </>
            ),
          },
          {
            id: "play_icon_color",
            label: __("Play Icon Color", TEXT_DOMAIN),
            render: () => (
              <>
                <ColorField
                  id="play_icon_color"
                  value={settings.play_icon_color || "#212121"}
                  onChange={(v) => updateLocalSetting("play_icon_color", v)}
                />
                <p className="description">{__("Color of the play icon (default #212121).", TEXT_DOMAIN)}</p>
              </>
            ),
          },
          {
            id: "video_aspect_ratio",
            label: __("Video Aspect Ratio", TEXT_DOMAIN),
            render: () => (
              <>
                <ClassicSelect
                  id="video_aspect_ratio"
                  value={settings.video_aspect_ratio || "16-9"}
                  onChange={(val) => updateLocalSetting("video_aspect_ratio", val)}
                  options={[
                    { label: "16:9", value: "16-9" },
                    { label: "1:1", value: "1-1" },
                    { label: "4:3", value: "4-3" },
                    { label: "9:16", value: "9-16" },
                  ]}
                />
                <p className="description">{__("Shape of the video slide in the gallery.", TEXT_DOMAIN)}</p>
              </>
            ),
          },
          {
            id: "gallery_fixed_height",
            label: __("Fixed Gallery Height", TEXT_DOMAIN),
            render: () => (
              <>
                <ClassicToggle
                  id="gallery_fixed_height"
                  checked={settings.gallery_fixed_height ?? false}
                  onChange={(checked) => updateLocalSetting("gallery_fixed_height", checked)}
                />
                <p className="description">{__("Keep the gallery the same height for videos and images so the page does not jump when switching slides.", TEXT_DOMAIN)}</p>
              </>
            ),
          },
          {
            id: "show_description",
            label: __("Show Video Description", TEXT_DOMAIN),
            render: () => (
              <>
                <ClassicToggle
                  id="show_description"
                  checked={settings.show_description ?? false}
                  onChange={(checked) => updateLocalSetting("show_description", checked)}
                />
                <p className="description">{__("Show the YouTube video description below the player.", TEXT_DOMAIN)}</p>
              </>
            ),
          },
          {
            id: "allow_fullscreen",
            label: __("Allow Fullscreen", TEXT_DOMAIN),
            render: () => (
              <>
                <ClassicToggle
                  id="allow_fullscreen"
                  checked={settings.allow_fullscreen ?? true}
                  onChange={(checked) => updateLocalSetting("allow_fullscreen", checked)}
                />
                <p className="description">{__("Let visitors play videos in fullscreen.", TEXT_DOMAIN)}</p>
              </>
            ),
          },
          {
            id: "allow_pip",
            label: __("Allow Picture-in-Picture", TEXT_DOMAIN),
            render: () => (
              <>
                <ClassicToggle
                  id="allow_pip"
                  checked={settings.allow_pip ?? true}
                  onChange={(checked) => updateLocalSetting("allow_pip", checked)}
                />
                <p className="description">{__("Let visitors pop the video out into a floating window.", TEXT_DOMAIN)}</p>
              </>
            ),
          },
          {
            id: "video_schema",
            label: __("Video Structured Data", TEXT_DOMAIN),
            render: () => (
              <>
                <ClassicToggle
                  id="video_schema"
                  checked={settings.video_schema ?? true}
                  onChange={(checked) => updateLocalSetting("video_schema", checked)}
                />
                <p className="description">{__("Add video structured data (SEO) to product pages so search engines can show video results.", TEXT_DOMAIN)}</p>
              </>
            ),
          },
        ]}
      />

      <ClassicSettingsTable
        title={
          <>
            {__("Pro Gallery Options", TEXT_DOMAIN)}
            {locked && <ProBadge />}
          </>
        }
        description={
          locked
            ? __("These options are available in TubeBay Pro.", TEXT_DOMAIN)
            : __("Advanced gallery behavior and thumbnail styling.", TEXT_DOMAIN)
        }
        fields={[
          {
            id: "thumb_nav_mode",
            label: (
              <>
                {__("Thumbnail Navigation", TEXT_DOMAIN)}
                {locked && <ProBadge />}
              </>
            ),
            render: () => (
              <ProLock locked={locked}>
                <ClassicSelect
                  id="thumb_nav_mode"
                  value={settings.thumb_nav_mode || "click"}
                  onChange={(val) => updateLocalSetting("thumb_nav_mode", val)}
                  disabled={locked}
                  options={[
                    { label: __("Click", TEXT_DOMAIN), value: "click" },
                    { label: __("Hover", TEXT_DOMAIN), value: "hover" },
                  ]}
                />
                <p className="description">{__("Switch slides when a thumbnail is clicked or hovered.", TEXT_DOMAIN)}</p>
              </ProLock>
            ),
          },
          {
            id: "sticky_video",
            label: (
              <>
                {__("Sticky Video", TEXT_DOMAIN)}
                {locked && <ProBadge />}
              </>
            ),
            render: () => (
              <ProLock locked={locked}>
                <ClassicToggle
                  id="sticky_video"
                  checked={settings.sticky_video ?? false}
                  onChange={(checked) => updateLocalSetting("sticky_video", checked)}
                  disabled={locked}
                />
                <p className="description">{__("Keep the video visible in a small floating player while visitors scroll past the gallery.", TEXT_DOMAIN)}</p>
              </ProLock>
            ),
          },
          {
            id: "media_toggle",
            label: (
              <>
                {__("Video/Image Toggle", TEXT_DOMAIN)}
                {locked && <ProBadge />}
              </>
            ),
            render: () => (
              <ProLock locked={locked}>
                <ClassicToggle
                  id="media_toggle"
                  checked={settings.media_toggle ?? false}
                  onChange={(checked) => updateLocalSetting("media_toggle", checked)}
                  disabled={locked}
                />
                <p className="description">{__("Show a Video / Images switch above the gallery so visitors can view one type at a time.", TEXT_DOMAIN)}</p>
              </ProLock>
            ),
          },
          {
            id: "thumb_border_width",
            label: (
              <>
                {__("Thumbnail Border Width", TEXT_DOMAIN)}
                {locked && <ProBadge />}
              </>
            ),
            render: () => (
              <ProLock locked={locked}>
                <input
                  type="number"
                  id="thumb_border_width"
                  className="small-text"
                  value={settings.thumb_border_width ?? 0}
                  onChange={(e) => updateLocalSetting("thumb_border_width", clampInt(e.target.value, 0, 10))}
                  min="0"
                  max="10"
                  step="1"
                  disabled={locked}
                />{" "}
                px
                <p className="description">{__("0 to 10 pixels. 0 means no border.", TEXT_DOMAIN)}</p>
              </ProLock>
            ),
          },
          {
            id: "thumb_border_color",
            label: (
              <>
                {__("Thumbnail Border Color", TEXT_DOMAIN)}
                {locked && <ProBadge />}
              </>
            ),
            render: () => (
              <ProLock locked={locked}>
                <ColorField
                  id="thumb_border_color"
                  value={settings.thumb_border_color || "#dcdcde"}
                  onChange={(v) => updateLocalSetting("thumb_border_color", v)}
                  disabled={locked}
                />
              </ProLock>
            ),
          },
          {
            id: "thumb_radius",
            label: (
              <>
                {__("Thumbnail Corner Radius", TEXT_DOMAIN)}
                {locked && <ProBadge />}
              </>
            ),
            render: () => (
              <ProLock locked={locked}>
                <input
                  type="number"
                  id="thumb_radius"
                  className="small-text"
                  value={settings.thumb_radius ?? 0}
                  onChange={(e) => updateLocalSetting("thumb_radius", clampInt(e.target.value, 0, 50))}
                  min="0"
                  max="50"
                  step="1"
                  disabled={locked}
                />{" "}
                px
                <p className="description">{__("0 to 50 pixels.", TEXT_DOMAIN)}</p>
              </ProLock>
            ),
          },
          {
            id: "thumb_active_color",
            label: (
              <>
                {__("Active Thumbnail Color", TEXT_DOMAIN)}
                {locked && <ProBadge />}
              </>
            ),
            render: () => (
              <ProLock locked={locked}>
                <ColorField
                  id="thumb_active_color"
                  value={settings.thumb_active_color || "#2271b1"}
                  onChange={(v) => updateLocalSetting("thumb_active_color", v)}
                  disabled={locked}
                />
                <p className="description">{__("Highlight color for the currently selected thumbnail.", TEXT_DOMAIN)}</p>
              </ProLock>
            ),
          },
          {
            id: "custom_css",
            label: (
              <>
                {__("Custom CSS", TEXT_DOMAIN)}
                {locked && <ProBadge />}
              </>
            ),
            render: () => (
              <ProLock locked={locked}>
                <ClassicTextarea
                  id="custom_css"
                  rows={8}
                  spellCheck={false}
                  style={{ fontFamily: "monospace" }}
                  value={settings.custom_css ?? ""}
                  onChange={(e) => updateLocalSetting("custom_css", e.target.value)}
                  disabled={locked}
                  description={__("Extra CSS added to every front-end page of your store. Only users who are allowed to post unfiltered HTML can save changes here.", TEXT_DOMAIN)}
                />
              </ProLock>
            ),
          },
        ]}
      />
    </>
  );
};
