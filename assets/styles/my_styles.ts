import { StyleSheet } from 'react-native'
import { StatusBar } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: "white",
    paddingTop: StatusBar.currentHeight || 70,
  },
  landingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "white",
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: "clear",
    color: "black"
  },
  landingTitle: {
    fontSize: 50,
    fontWeight: 400,
    backgroundColor: "clear",
    color: "white",
    textAlign: 'center',
    fontFamily: 'georgia',
    marginBottom: 20,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
    backgroundColor: "white",
    color: "black"
  },
  mainInput: {
    backgroundColor: "white",
    borderColor: "grey",
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    marginBottom: 8,
    height: 80,
    width: '85%',
  },
  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 100,
    paddingBottom: 100,
  },
  secondary: {
    fontSize: 20,
    fontWeight: 'normal',
    backgroundColor: "clear",
    color: "white",
    fontFamily: 'arial',
  },
  largeLogo: {
    width: 130,
    height: 130,
    marginBottom: 20,
  },
  largeButton: {
    backgroundColor: "#2D5A3D",
    color: "white",
    borderRadius: 32,
    padding: 12,
    marginBottom: 8,
    height: 50,
    width: '85%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topPadding: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
  },
  bottomPadding: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
});