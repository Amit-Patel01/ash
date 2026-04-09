import 'package:flutter/material.dart';

class BrandLogo extends StatelessWidget {
  const BrandLogo({
    super.key,
    this.size = 84,
    this.padding = 12,
    this.borderRadius = 24,
    this.backgroundColor = const Color(0x140EA5E9),
    this.showFrame = true,
  });

  final double size;
  final double padding;
  final double borderRadius;
  final Color backgroundColor;
  final bool showFrame;

  @override
  Widget build(BuildContext context) {
    final image = Image.asset(
      'assets/branding/logo.png',
      fit: BoxFit.contain,
    );

    return SizedBox(
      width: size,
      height: size,
      child: showFrame
          ? DecoratedBox(
              decoration: BoxDecoration(
                color: backgroundColor,
                borderRadius: BorderRadius.circular(borderRadius),
                border: Border.all(
                  color: Colors.white.withValues(alpha: 0.08),
                ),
              ),
              child: Padding(
                padding: EdgeInsets.all(padding),
                child: image,
              ),
            )
          : Padding(
              padding: EdgeInsets.all(padding),
              child: image,
            ),
    );
  }
}
