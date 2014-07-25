import java.io.*;
import org.apache.batik.transcoder.*;
import org.apache.batik.transcoder.image.*;
import org.apache.batik.util.*;
import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.platform.Verticle;

public class ImageExporter extends Verticle {
	
	public void start() {
		Handler<Message<JsonObject>> exportHandler = new Handler<Message<JsonObject>>() {
			public void handle(Message<JsonObject> message) {
				String svg = message.body().getString("svg");
				String css = message.body().getString("css");
				message.reply(new JsonObject().putString("data", getPng(svg, css)));
			}
		};
		vertx.eventBus().registerHandler("mindMaps.exporter.svg2png", exportHandler);
	}

	private String getPng(String svg, String css) {
		String cssDataUrl =	"data:text/css;base64,"+encodeBase64(css);
		try {
			PNGTranscoder transcoder = new PNGTranscoder();
			transcoder.addTranscodingHint(
			SVGAbstractTranscoder.KEY_USER_STYLESHEET_URI, cssDataUrl);

			TranscoderInput input = new TranscoderInput(new StringReader(svg));

			ByteArrayOutputStream output = new ByteArrayOutputStream();
			transcoder.transcode(input, new TranscoderOutput(output));
			return encodeBase64(output.toByteArray());
		} catch (TranscoderException te) {
		//container.logger().error("Nepodarilo se zkonvertovat do svg", e);
			return null;
		}
	}

	private String encodeBase64(String input) {
		return encodeBase64(input.getBytes());
	}

	private String encodeBase64(byte[] input) {
		try {
			ByteArrayOutputStream out = new ByteArrayOutputStream();
			Base64EncoderStream encoder = new Base64EncoderStream(out);
			encoder.write(input);
			encoder.close();
			return new String(out.toByteArray());
		} catch (IOException oe) {
			//container.logger().error("Nepodarilo se enkodovat Base64", e);
			return null;
		}
	}
}
